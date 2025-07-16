import os
from ultralytics import YOLO
from pathlib import Path

# Set up paths
base_dir = Path(__file__).parent
DATA_CONFIG = os.path.join(base_dir, "yolo_params.yaml")

# Standard training arguments for train/val split
TRAIN_ARGS = dict(
    model="yolov8l.pt",  # Change to yolov8l.pt if your GPU can handle it
    data=DATA_CONFIG,
    epochs=200,
    imgsz=640,
    batch=4,           # Adjust based on your VRAM
    optimizer="SGD",
    lr0=0.001,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    flipud=0.2,
    fliplr=0.5,
    mosaic=1.0,
    mixup=0.3,
    patience=0,
    workers=0,
    device=0,
    single_cls=False
)

if __name__ == '__main__':
 
    model = YOLO(TRAIN_ARGS['model'])
    results = model.train(**TRAIN_ARGS)