from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import base64
import os

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to your trained model
MODEL_PATH = '../../runs/detect/train5/weights/best.pt'

# Dynamically load class names from classes.txt in the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLASSES_PATH = os.path.join(PROJECT_ROOT, "classes.txt")
with open(CLASSES_PATH, "r") as f:
    CLASS_NAMES = [line.strip() for line in f.readlines() if line.strip()]

# Load model once at startup
model = YOLO(MODEL_PATH)

@app.post('/detect')
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    all_detections = []
    color_map = {
        0: (0, 255, 0),   # FireExtinguisher
        1: (255, 0, 0),   # ToolBox
        2: (0, 0, 255)    # OxygenTank
    }
    results = model(image)
    for r in results:
        if r.boxes is not None:
            boxes = r.boxes.xyxy.cpu().numpy()
            confs = r.boxes.conf.cpu().numpy()
            clss = r.boxes.cls.cpu().numpy().astype(int)
            for box, conf, cls in zip(boxes, confs, clss):
                if float(conf) > 0.5:
                    class_name = CLASS_NAMES[cls] if cls < len(CLASS_NAMES) else str(cls)
                    all_detections.append({
                        'class': class_name,
                        'conf': float(conf),
                        'box': [float(x) for x in box]
                    })
                    # Draw box
                    x1, y1, x2, y2 = map(int, box)
                    label = f"{class_name} {conf:.2f}"
                    color = color_map.get(cls, (255, 255, 0))
                    cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
    # Encode processed image to base64
    _, buffer = cv2.imencode('.png', image)
    img_str = base64.b64encode(buffer).decode('utf-8')
    # Stats for charts
    class_counts = {name: sum(1 for d in all_detections if d['class'] == name) for name in CLASS_NAMES}
    confs = [d['conf'] for d in all_detections]
    return JSONResponse({
        'detections': all_detections,
        'image': img_str,
        'class_counts': class_counts,
        'confidences': confs
    }) 