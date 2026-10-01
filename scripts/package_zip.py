import os
import zipfile
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUTPUT_ZIP = os.path.join(ROOT_DIR, 'voiceflow360-source.zip')

EXCLUDE_DIRS = {
    'node_modules',
    'dist',
    '.git',
    '.cache',
    '__pycache__',
}

EXCLUDE_EXTENSIONS = {
    '.log',
    '.pyc',
}

EXCLUDE_PREFIXES = (
    'fix_',
    'patch_',
    'update_',
    'test.',
    'remove_demo',
    'force_settings',
)

def should_include_file(rel_path):
    parts = rel_path.split(os.sep)
    for part in parts:
        if part in EXCLUDE_DIRS:
            return False

    filename = os.path.basename(rel_path)
    if filename == 'voiceflow360-source.zip':
        return False

    for prefix in EXCLUDE_PREFIXES:
        if filename.startswith(prefix):
            return False

    _, ext = os.path.splitext(filename)
    if ext in EXCLUDE_EXTENSIONS:
        return False

    return True

def create_zip():
    print(f"Packaging source repository into {OUTPUT_ZIP}...")
    file_count = 0
    with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Prune excluded dirs in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, ROOT_DIR)
                if should_include_file(rel_path):
                    zip_file.write(abs_path, rel_path)
                    file_count += 1

    print(f"Packaged {file_count} files successfully.")
    size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
    print(f"Archive size: {size_mb:.2f} MB")

    # Also copy to public/ so Vite and Express serve it directly
    public_dir = os.path.join(ROOT_DIR, 'public')
    os.makedirs(public_dir, exist_ok=True)
    shutil.copy2(OUTPUT_ZIP, os.path.join(public_dir, 'voiceflow360-source.zip'))

    # Also copy to dist/ if dist exists
    dist_dir = os.path.join(ROOT_DIR, 'dist')
    if os.path.exists(dist_dir):
        shutil.copy2(OUTPUT_ZIP, os.path.join(dist_dir, 'voiceflow360-source.zip'))

if __name__ == '__main__':
    create_zip()
