import urllib.request
import json
import os
import sys

def fetch_dataset():
    print("Fetching karanverma19/Indian_Multilingual_Scam_Message_Dataset from Hugging Face...")
    all_rows = []
    offset = 0
    limit = 100
    
    while True:
        url = f"https://datasets-server.huggingface.co/rows?dataset=karanverma19%2FIndian_Multilingual_Scam_Message_Dataset&config=default&split=train&offset={offset}&limit={limit}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                rows = data.get('rows', [])
                if not rows:
                    break
                for item in rows:
                    all_rows.append(item.get('row', {}))
                print(f"Fetched {len(all_rows)} rows (offset: {offset})...")
                offset += len(rows)
                if len(rows) < limit:
                    break
        except Exception as e:
            print(f"Fetch completed or stopped at offset {offset}: {e}")
            break

    output_path = os.path.join("data", "indian_multilingual_scam_dataset.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_rows, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully saved {len(all_rows)} rows to {output_path}")
    
    # Analyze dataset statistics
    languages = {}
    domains = {}
    labels = {}
    for r in all_rows:
        lang = r.get('language', 'unknown')
        languages[lang] = languages.get(lang, 0) + 1
        dom = r.get('domain', 'unknown')
        domains[dom] = domains.get(dom, 0) + 1
        lab = r.get('label', 'unknown')
        labels[lab] = labels.get(lab, 0) + 1
        
    print("\nDataset Summary:")
    print("Languages:", languages)
    print("Domains:", domains)
    print("Labels:", labels)
    
    return all_rows

if __name__ == "__main__":
    fetch_dataset()
