import cv2
from ultralytics import YOLO
import argparse
import torch
import numpy as np

# Path to your trained model
MODEL_PATH = r"runs/detect/train5/weights/best.pt"

# Class names (update if your classes.txt is different)
CLASS_NAMES = ["fireextinguisher", "toolbox", "oxygen tank"]

def main():
    parser = argparse.ArgumentParser(description="Real-Time Object Detection with YOLO")
    parser.add_argument('--source', type=str, default='0', help='Webcam index (0, 1, ...) or DroidCam IP URL (e.g., http://192.168.1.2:4747/video)')
    parser.add_argument('--output', type=str, default=None, help='Path to save annotated video (e.g., output.mp4)')
    parser.add_argument('--device', type=str, default='0', help='Device to run on: 0 for GPU, cpu for CPU')
    parser.add_argument('--conf', type=float, default=0.5, help='Confidence threshold (default: 0.5)')
    parser.add_argument('--iou', type=float, default=0.5, help='IoU threshold for NMS (default: 0.5)')
    parser.add_argument('--max-det', type=int, default=300, help='Maximum detections per image (default: 300)')
    args = parser.parse_args()

    # Check GPU availability and set device
    if torch.cuda.is_available() and args.device != 'cpu':
        device = f'cuda:{args.device}' if args.device.isdigit() else args.device
        print(f"CUDA is available. Using GPU: {torch.cuda.get_device_name(0)}")
        print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    else:
        device = 'cpu'
        print("Using CPU for inference")

    # Handle webcam index or DroidCam URL
    source = args.source
    if source.isdigit():
        source = int(source)

    # Load YOLO model
    print("Loading YOLO model...")
    model = YOLO(MODEL_PATH)
    
    # Move model to specified device (GPU/CPU)
    model.to(device)
    print(f"Model loaded and moved to device: {device}")
    print(f"Confidence threshold: {args.conf}")
    print(f"IoU threshold: {args.iou}")

    # Open video capture
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        print(f"Error: Could not open video source {args.source}")
        return

    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS) or 20.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"Video source: {width}x{height} @ {fps:.1f} FPS")

    # Prepare video writer if output is specified
    writer = None
    if args.output:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(args.output, fourcc, fps, (width, height))
        print(f"Saving output to: {args.output}")

    import time
    prev_time = time.time()
    frame_count = 0
    fps_display = 0
    
    print("Starting real-time detection... Press 'q' to quit")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        # Run YOLO inference with optimized parameters
        with torch.no_grad():
            results = model(
                frame, 
                device=device, 
                conf=args.conf,
                iou=args.iou,
                max_det=args.max_det,
                verbose=False,
                augment=False,  # Disable test-time augmentation for speed
                agnostic_nms=False,  # Class-specific NMS
                half=True if device != 'cpu' else False  # Use FP16 for GPU
            )[0]

        # Draw detections
        if results.boxes is not None:
            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                conf = float(box.conf[0].cpu().numpy())
                cls = int(box.cls[0].cpu().numpy())
                
                # Apply basic filters
                if (conf >= args.conf and 
                    cls < len(CLASS_NAMES) and
                    x1 >= 0 and y1 >= 0 and x2 <= width and y2 <= height):  # Boundary check
                    
                    label = f"{CLASS_NAMES[cls]} {conf:.2f}"
                    
                    # Color coding based on confidence
                    if conf >= 0.7:
                        color = (0, 255, 0)  # Green for high confidence
                    elif conf >= 0.6:
                        color = (0, 255, 255)  # Yellow for medium confidence
                    else:
                        color = (0, 165, 255)  # Orange for lower confidence
                    
                    # Draw bounding box with thickness based on confidence
                    thickness = 3 if conf >= 0.7 else 2
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
                    
                    # Draw label background
                    label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
                    cv2.rectangle(frame, (x1, y1 - label_size[1] - 10), (x1 + label_size[0], y1), color, -1)
                    
                    # Draw label text
                    cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

        # FPS calculation and display
        frame_count += 1
        if frame_count >= 10:
            curr_time = time.time()
            fps_display = frame_count / (curr_time - prev_time)
            prev_time = curr_time
            frame_count = 0

        # Display information
        cv2.putText(frame, f"FPS: {fps_display:.1f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, f"Device: {device.upper()}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        cv2.putText(frame, f"Conf: {args.conf} | IoU: {args.iou}", (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

        # Show frame
        cv2.imshow('Real-Time Detection (Press Q to quit)', frame)

        # Write frame if saving
        if writer:
            writer.write(frame)

        # Check for quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Cleanup
    cap.release()
    if writer:
        writer.release()
    cv2.destroyAllWindows()
    print("Detection stopped")

if __name__ == "__main__":
    main()
