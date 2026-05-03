#!/usr/bin/env python3
"""
Generate 8 art-style sample images into public/samples/.
They get bundled into the dist on the next build.

Run from the repo root:
    GEMINI_API_KEY=... python3 generate_style_samples.py
"""

import os, sys, time, io, pathlib
from PIL import Image

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL          = "gemini-3-pro-image-preview"
LOCAL_DIR      = pathlib.Path(__file__).parent / "public" / "samples"

try:
    from google import genai
    from google.genai import types
except ImportError:
    sys.exit("pip install google-genai Pillow")

if not GEMINI_API_KEY:
    sys.exit("Set GEMINI_API_KEY first.")

LOCAL_DIR.mkdir(parents=True, exist_ok=True)
client = genai.Client(api_key=GEMINI_API_KEY)

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
    dict(id="cartoon",     prompt=BASE_SCENE + " Style: classic Saturday-morning cartoon. Thick black outlines, vivid flat colours, bold shapes, high contrast, cheerful and energetic."),
    dict(id="watercolour", prompt=BASE_SCENE + " Style: soft watercolour picture-book illustration. Loose painterly washes, delicate bleed edges, pastel palette, dreamy light, gentle and tender."),
    dict(id="manga",       prompt=BASE_SCENE + " Style: black-and-white manga. Expressive large eyes, dynamic ink lines, screen-tone shading, speed lines in the background, high contrast, energetic."),
    dict(id="vintage",     prompt=BASE_SCENE + " Style: 1950s vintage newspaper comic strip. Halftone dot shading, limited 3-colour palette (red, yellow, blue on cream newsprint), thick outlines, retro nostalgia feel."),
    dict(id="sketch",      prompt=BASE_SCENE + " Style: loose pencil-and-ink sketch illustration, like Quentin Blake's Roald Dahl artwork. Wobbly expressive lines, light watercolour wash accents, energetic hand-drawn feel, slightly messy and full of life."),
    dict(id="cinematic",   prompt=BASE_SCENE + " Style: Pixar / DreamWorks 3D animated film still. Rich subsurface scattering on skin, dramatic warm golden-hour lighting, shallow depth of field, highly detailed textures, cinematic and emotional, NOT photorealistic."),
    dict(id="collage",     prompt=BASE_SCENE + " Style: Eric Carle-inspired torn tissue-paper collage. Bold flat cut-paper shapes with visible paper texture and layering, vivid primary colours, simple graphic outlines, joyful and tactile."),
    dict(id="whimsical",   prompt=BASE_SCENE + " Style: Dr. Seuss whimsical illustration. Impossibly curved trees and invented plants, bright primary colours, bouncy rounded shapes, playful impossible physics, characters with exaggerated proportions."),
]

SAFETY_OFF = [
    types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold=types.HarmBlockThreshold.OFF),
    types.SafetySetting(category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold=types.HarmBlockThreshold.OFF),
]

def generate(style: dict) -> bool:
    sid  = style["id"]
    dest = LOCAL_DIR / f"style-{sid}.png"
    print(f"[{sid}] generating...", flush=True)

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
        print(f"[{sid}] ERROR: no image returned")
        return False

    img = Image.open(io.BytesIO(image_data))
    img.save(dest, format="PNG")
    print(f"[{sid}] saved → {dest}")
    return True

ok = 0
for style in STYLES:
    if generate(style):
        ok += 1
    time.sleep(2)

print(f"\n{ok}/8 saved to {LOCAL_DIR}")
