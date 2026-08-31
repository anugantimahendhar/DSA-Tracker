import os

for root, dirs, files in os.walk("backend"):
    for f in files:
        if f.endswith(".py"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
            # Replace backslash quote with quote
            cleaned = content.replace('\\"', '"').replace("\\'", "'")
            if cleaned != content:
                with open(path, "w", encoding="utf-8") as file:
                    file.write(cleaned)
                print("Cleaned", path)