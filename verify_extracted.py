import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\Admin\.gemini\antigravity-ide\scratch\fayzar-computer-v2\data\results_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

classes = {}
for s in data:
    cid = s['class_id']
    if cid not in classes:
        classes[cid] = {'name': s['class_name_bn'], 'count': 0, 'students': []}
    classes[cid]['count'] += 1
    classes[cid]['students'].append(f"রোল {s['roll']}: {s['student_name_bn']} (GPA {s['gpa']}, গ্রেড: {s['grade']})")

print(f"সর্বমোট সংগৃহীত শিক্ষার্থী: {len(data)} জন\n")
for cid, info in classes.items():
    print(f"শ্রেণি: {info['name']} (আইডি: {cid}) - মোট {info['count']} জন")
    for st in info['students'][:4]:
        print(f"   • {st}")
    if len(info['students']) > 4:
        print(f"   • ... এবং আরও {len(info['students'])-4} জন")
    print("-" * 50)
