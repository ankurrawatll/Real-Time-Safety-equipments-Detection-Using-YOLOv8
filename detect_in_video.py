import cv2
from ultralytics import YOLO
import os

# Paths
VIDEO_PATH = r'C:\Users\Ankur Rawat\Downloads\Duality_AI_Task\Duality_ai\Image to video 丨 First-person POV of astronaut fast-walking through ISS corridor.mp4'
MODEL_PATH = r'C:\Users\Ankur Rawat\Downloads\Duality_AI_Task\Duality_ai\runs\detect\train5\weights\best.pt'
OUTPUT_PATH = 'output_detected_video.mp4'

# Load YOLOv8 model
model = YOLO(MODEL_PATH)

# Open video
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    print(f"Error opening video file: {VIDEO_PATH}")
    exit(1)

# Get video properties
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(OUTPUT_PATH, fourcc, fps, (width, height))

# Get class names from classes.txt if available
class_names = None
if os.path.exists('classes.txt'):
    with open('classes.txt', 'r') as f:
        class_names = [line.strip() for line in f.readlines()]

def draw_boxes(frame, results):
    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        conf = float(box.conf[0])
        cls = int(box.cls[0])
        label = f"{class_names[cls] if class_names else cls}: {conf:.2f}"
        color = (0, 255, 0)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    return frame

print("Starting detection...")
frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    # Run detection
    results = model(frame)[0]
    # Draw boxes
    frame = draw_boxes(frame, results)
    out.write(frame)
    frame_count += 1
    if frame_count % 30 == 0:
        print(f"Processed {frame_count} frames...")

cap.release()
out.release()
print(f"Detection complete. Output saved to {OUTPUT_PATH}") 
