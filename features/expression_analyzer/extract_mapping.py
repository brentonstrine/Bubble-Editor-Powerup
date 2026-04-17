import json
import re

def extract_attributes():
    path = '/Users/dev/Documents/GitHub/CodelessLove/Bubble-Powerup/features/expression_analyzer/app1.json'
    with open(path, 'r') as f:
        raw = f.read()
    
    # Fix corrupted JSON strings: replace "\\" with \"
    # and and \"\" with \"
    # The error was "line 7435 column 21" - " \\"0\\"": {
    # Let's try to be specific: replace \\" with \"
    fixed = raw.replace('\\\\"', '\\"')
    
    try:
        data = json.loads(fixed)
    except Exception as e:
        print(f"Failed to parse fixed JSON: {e}")
        # Secondary fix: sometimes literals like "0" are double quoted.
        # Let's try to find those.
        fixed2 = re.sub(r'\\"\\"(.*?)\\"\\"', r'\"\1\"', fixed)
        try:
            data = json.loads(fixed2)
        except Exception as e2:
            print(f"Failed to parse after second fix: {e2}")
            return

    mapping = {} 
    
    graph = data.get('graph', {})
    for lho_id, entry in graph.items():
        options = entry.get('options', {})
        for label, opt in options.items():
            op_key = opt.get('operatorKey')
            ds_key = opt.get('datasourceKey')
            
            if op_key:
                # Store the most common label for this key
                mapping[( 'data-operator-name', op_key)] = label
            if ds_key:
                mapping[( 'data-datasource-name', ds_key)] = label

    results = []
    for (attr, val), label in mapping.items():
        results.append({
            "Attribute": attr,
            "Internal Value": val,
            "UI Label": label
        })
    
    results.sort(key=lambda x: (x["Attribute"], x["Internal Value"]))
    
    print("| Attribute | Internal Value | UI Label |")
    print("| :--- | :--- | :--- |")
    for r in results:
        print(f"| {r['Attribute']} | {r['Internal Value']} | {r['UI Label']} |")

if __name__ == "__main__":
    extract_attributes()
