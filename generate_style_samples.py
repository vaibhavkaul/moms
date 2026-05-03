#!/usr/bin/env python3
"""
One-off script: generate 8 art-style sample images and upload to
s3://moms.kidsartto.life/samples/style-{id}.png

Run from the repo root:
    GEMINI_API_KEY=... python generate_style_samples.py
Or if key is already in the env/source_env.sh:
    source /Users/vkaul/code/kidsarttolife/backend/source_env.sh && python generate_style_samples.py
"""

import os, sys, time, boto3, io
from PIL import Image

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
S3_BUCKET      = "moms.kidsartto.life"
S3_PREFIX      = "samples"
MODEL          = "gemini-3-pro-image-preview"

try:
    from google import genai
    from google.genai import types
except ImportError:
    sys.exit("Install google-genai:  pip install google-genai")

if not GEMINI_API_KEY:
    sys.exit("Set GEMINI_API_KEY in your environment first.")

client = genai.Client(api_key=GEMINI_API_KEY)

# ── Scene shared across all styles ───────────────────────────────────────────
BASE_SCENE = (
    "A single illustrated comic book panel. "
    "A warm-skinned mom and her young child (around 6 years old) are standing together "
    "outdoors under a big sky. The mom is kneeling down to the child's level, "
    "pointing excitedly at a glowing butterfly hovering just in front of them. "
    "The child's mouth is open in wonder, arms outstretched. "
    "Both faces are clearly visible and expressive. "
    "Wide shot, horizontal panel format (landscape orientation, roughly 16:9). "
    "No speech bubbles. No text. No borders."
)

STYLES = [
    dict(
        id="cartoon",
        prompt=BASE_SCENE + (
            " Style: classic Saturday-morning cartoon. Thick black outlines, "
            "vivid flat colours, bold shapes, high contrast, cheerful and energetic."
        ),
    ),
    dict(
        id="watercolour",
        prompt=BASE_SCENE + (
            " Style: soft watercolour picture-book illustration. Loose painterly washes, "
            "delicate bleed edges, pastel palette, dreamy light, gentle and tender."
        ),
    ),
    dict(
        id="manga",
        prompt=BASE_SCENE + (
            " Style: black-and-white manga. Expressive large eyes, dynamic ink lines, "
            "screen-tone shading, speed lines in the background, high contrast, energetic."
        ),
    ),
    dict(
        id="vintage",
        prompt=BASE_SCENE + (
            " Style: 1950s vintage newspaper comic strip. Halftone dot shading, "
            "limited 3-colour palette (red, yellow, blue on cream newsprint), "
            "thick outlines, retro nostalgia feel."
        ),
    ),
    dict(
        id="sketch",
        prompt=BASE_SCENE + (
            " Style: loose pencil-and-ink sketch illustration, like Quentin Blake's "
            "Roald Dahl artwork. Wobbly expressive lines, light watercolour wash accents, "
            "energetic hand-drawn feel, slightly messy and full of life."
        ),
    ),
    dict(
        id="cinematic",
        prompt=BASE_SCENE + (
            " Style: Pixar / DreamWorks 3D animated film still. Rich subsurface scattering "
            "on skin, dramatic warm golden-hour lighting, shallow depth of field, "
            "photorealistic textures, cinematic and emotional."
        ),
    ),
    dict(
        id="collage",
        prompt=BASE_SCENE + (
            " Style: Eric Carle-inspired torn tissue-paper collage. Bold flat cut-paper "
            "shapes with visible paper texture and layering, vivid primary colours, "
            "simple graphic outlines, joyful and tactile."
        ),
    ),
    dict(
        id="whimsical",
        prompt=BASE_SCENE + (
            " Style: Dr. Seuss whimsical illustration. Impossibly curved trees and "
            "invented plants, bright primary colours, bouncy rounded shapes, "
            "playful impossible physics, characters with exaggerated proportions."
        ),
    ),
]

SAFETY_OFF = [
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold=types.HarmBlockThreshold.OFF,
    ),
    types.SafetySetting(
        category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold=types.HarmBlockThreshold.OFF,
    ),
]

s3 = boto3.client("s3")

def generate_and_upload(style: dict) -> str:
    sid   = style["id"]
    s3key = f"{S3_PREFIX}/style-{sid}.png"
    cdn   = f"https://moms.kidsartto.life/{s3key}"

    print(f"\n[{sid}] Generating...")
    resp = client.models.generate_content(
        model=MODEL,
        contents=[style["prompt"]],
        config=types.GenerateContentConfig(safety_settings=SAFETY_OFF),
    )

    image_data = None
    for cand in resp.candidates:
        for part in cand.content.parts:
            if part.inline_data:
                image_data = part.inline_data.data
                break
        if image_data:
            break

    if not image_data:
        print(f"[{sid}] ERROR: no image in response")
        return None

    # Re-encode as PNG
    img = Image.open(io.BytesIO(image_data))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    print(f"[{sid}] Uploading to s3://{S3_BUCKET}/{s3key} ...")
    s3.upload_fileobj(
        buf, S3_BUCKET, s3key,
        ExtraArgs={"ContentType": "image/png", "CacheControl": "public, max-age=31536000"},
    )
    print(f"[{sid}] Done → {cdn}")
    return cdn

results = {}
for style in STYLES:
    url = generate_and_upload(style)
    if url:
        results[style["id"]] = url
    time.sleep(2)   # be gentle with rate limits

print("\n\n=== RESULTS ===")
for sid, url in results.items():
    print(f"  {sid}: '{url}',")
print(f"\n{len(results)}/8 images generated successfully.")
