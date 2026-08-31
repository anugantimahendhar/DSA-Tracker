-- Seed Data
DO $$
DECLARE
    q1_id UUID := 'a0000000-0000-0000-0000-000000000001';
    q2_id UUID := 'a0000000-0000-0000-0000-000000000002';
    q3_id UUID := 'a0000000-0000-0000-0000-000000000003';
    q4_id UUID := 'a0000000-0000-0000-0000-000000000004';
    q5_id UUID := 'a0000000-0000-0000-0000-000000000005';
    q6_id UUID := 'a0000000-0000-0000-0000-000000000006';
    q7_id UUID := 'a0000000-0000-0000-0000-000000000007';
    q8_id UUID := 'a0000000-0000-0000-0000-000000000008';
BEGIN

INSERT INTO public.questions (
    id, code, title, description, constraints, examples, explanation,
    difficulty, topic, pattern, company_tags, status, starter_templates
) VALUES (
    q1_id,
    'TWO-SUM',
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer formatted as space-separated indices.',
    '2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.',
    '[{"input": "2 7 11 15\n9", "output": "0 1", "explanation": "nums[0] + nums[1] == 9"}]'::jsonb,
    '### Hash Map Solution

Iterate through the array maintaining a hash map of value to index. Check if complement exists.',
    'Easy',
    'Arrays',
    'Hashing',
    ARRAY['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft'],
    'Published',
    '{
        "python": "import sys\n\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return f\"{seen[comp]} {i}\"\n        seen[num] = i\n    return \"\"\n\nif __name__ == \"__main__\":\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        nums = list(map(int, lines[0].strip().split()))\n        target = int(lines[1].strip())\n        print(two_sum(nums, target))\n",
        "javascript": "const fs = require(''fs'');\nconst lines = fs.readFileSync(0, ''utf-8'').trim().split(''\\n'');\nif (lines.length >= 2) {\n    const nums = lines[0].trim().split(/\\s+/).map(Number);\n    const target = Number(lines[1].trim());\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) {\n            console.log(${map.get(comp)} );\n            process.exit(0);\n        }\n        map.set(nums[i], i);\n    }\n}\n",
        "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    string l1, l2;\n    if (getline(cin, l1) && getline(cin, l2)) {\n        stringstream ss(l1);\n        vector<int> nums;\n        int v, target = stoi(l2);\n        while (ss >> v) nums.push_back(v);\n        unordered_map<int, int> seen;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            int comp = target - nums[i];\n            if (seen.count(comp)) {\n                cout << seen[comp] << \" \" << i << \"\\n\";\n                return 0;\n            }\n            seen[nums[i]] = i;\n        }\n    }\n    return 0;\n}\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n            int[] nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n            int target = sc.nextInt();\n            Map<Integer, Integer> seen = new HashMap<>();\n            for (int i = 0; i < nums.length; i++) {\n                int comp = target - nums[i];\n                if (seen.containsKey(comp)) {\n                    System.out.println(seen.get(comp) + \" \" + i);\n                    return;\n                }\n                seen.put(nums[i], i);\n            }\n        }\n    }\n}\n"
    }'::jsonb
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.test_cases (question_id, input, expected_output, is_hidden, order_index) VALUES
(q1_id, E'2 7 11 15\n9', '0 1', false, 1),
(q1_id, E'3 2 4\n6', '1 2', false, 2),
(q1_id, E'3 3\n6', '0 1', false, 3),
(q1_id, E'1 5 8 10 14 20\n24', '3 4', true, 4),
(q1_id, E'-3 4 3 90\n0', '0 2', true, 5);

-- QUESTION 2: Valid Parentheses
INSERT INTO public.questions (
    id, code, title, description, constraints, examples, explanation,
    difficulty, topic, pattern, company_tags, status, starter_templates
) VALUES (
    q2_id,
    'VALID-PARENTHESES',
    'Valid Parentheses',
    'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.',
    '1 <= s.length <= 10^4
s consists of parentheses only.',
    '[{"input": "()", "output": "true", "explanation": "Matching pair"}, {"input": "()[]{}", "output": "true", "explanation": "All pairs matched"}, {"input": "(]", "output": "false", "explanation": "Mismatched brackets"}]'::jsonb,
    '### Stack Solution

Push open brackets, pop and compare on closing bracket.',
    'Easy',
    'Stack',
    'Stack Pattern',
    ARRAY['Amazon', 'Facebook', 'Bloomberg', 'Microsoft'],
    'Published',
    '{
        "python": "import sys\ndef is_valid(s: str) -> bool:\n    st = []\n    mp = {\")\": \"(\", \"}\": \"{\", \"]\": \"[\"}\n    for c in s:\n        if c in mp:\n            top = st.pop() if st else \"#\"\n            if mp[c] != top: return False\n        else: st.append(c)\n    return not st\nif __name__ == \"__main__\":\n    s = sys.stdin.read().strip()\n    print(str(is_valid(s)).lower())\n",
        "javascript": "const fs = require(''fs'');\nconst s = fs.readFileSync(0, ''utf-8'').trim();\nconst st = [], mp = {\")\": \"(\", \"}\": \"{\", \"]\": \"[\"};\nlet ok = true;\nfor (const c of s) {\n    if (mp[c]) {\n        const top = st.length ? st.pop() : \"#\";\n        if (mp[c] !== top) { ok = false; break; }\n    } else st.push(c);\n}\nconsole.log((ok && st.length === 0) ? \"true\" : \"false\");\n",
        "cpp": "#include <iostream>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    string s;\n    if (cin >> s) {\n        stack<char> st;\n        unordered_map<char, char> mp = {{'')'', ''(''}, {''}'' , ''{''}, {'']'', ''[''}};\n        bool ok = true;\n        for (char c : s) {\n            if (mp.count(c)) {\n                if (st.empty() || st.top() != mp[c]) { ok = false; break; }\n                st.pop();\n            } else st.push(c);\n        }\n        if (ok && st.empty()) cout << \"true\\n\";\n        else cout << \"false\\n\";\n    }\n    return 0;\n}\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            Deque<Character> st = new ArrayDeque<>();\n            Map<Character, Character> mp = Map.of('')'', ''('', ''}'', ''{'', '']'', ''['');\n            boolean ok = true;\n            for (char c : s.toCharArray()) {\n                if (mp.containsKey(c)) {\n                    if (st.isEmpty() || st.pop() != mp.get(c)) { ok = false; break; }\n                } else st.push(c);\n            }\n            System.out.println((ok && st.isEmpty()) ? \"true\" : \"false\");\n        }\n    }\n}\n"
    }'::jsonb
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.test_cases (question_id, input, expected_output, is_hidden, order_index) VALUES
(q2_id, '()', 'true', false, 1),
(q2_id, '()[]{}', 'true', false, 2),
(q2_id, '(]', 'false', false, 3),
(q2_id, '([{}])', 'true', true, 4),
(q2_id, '([)]', 'false', true, 5);

-- QUESTION 3: Best Time to Buy and Sell Stock
INSERT INTO public.questions (
    id, code, title, description, constraints, examples, explanation,
    difficulty, topic, pattern, company_tags, status, starter_templates
) VALUES (
    q3_id,
    'BEST-TIME-BUY-SELL-STOCK',
    'Best Time to Buy and Sell Stock',
    'Given an array prices where prices[i] is the stock price on day i, maximize profit with at most one buy and one sell.',
    '1 <= prices.length <= 10^5
0 <= prices[i] <= 10^4',
    '[{"input": "7 1 5 3 6 4", "output": "5", "explanation": "Buy at 1, sell at 6"}]'::jsonb,
    '### Single Pass Greedy

Track minimum price so far and max profit difference.',
    'Easy',
    'Arrays',
    'Greedy',
    ARRAY['Amazon', 'Facebook', 'Google', 'Microsoft'],
    'Published',
    '{
        "python": "import sys\n\ndef max_profit(prices):\n    min_p, max_p = float(\"inf\"), 0\n    for p in prices:\n        if p < min_p: min_p = p\n        elif p - min_p > max_p: max_p = p - min_p\n    return max_p\nif __name__ == \"__main__\":\n    line = sys.stdin.read().strip()\n    if line:\n        prices = list(map(int, line.split()))\n        print(max_profit(prices))\n",
        "javascript": "const fs = require(''fs'');\nconst input = fs.readFileSync(0, ''utf-8'').trim();\nif (input) {\n    const prices = input.split(/\\s+/).map(Number);\n    let minP = Infinity, maxP = 0;\n    for (const p of prices) {\n        if (p < minP) minP = p;\n        else if (p - minP > maxP) maxP = p - minP;\n    }\n    console.log(maxP);\n}\n",
        "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\nint main() {\n    string line;\n    if (getline(cin, line)) {\n        stringstream ss(line);\n        int p, minP = 1e9, maxP = 0;\n        while (ss >> p) {\n            if (p < minP) minP = p;\n            else maxP = max(maxP, p - minP);\n        }\n        cout << maxProfit << \"\\n\";\n    }\n    return 0;\n}\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int minP = Integer.MAX_VALUE, maxP = 0;\n        while (sc.hasNextInt()) {\n            int p = sc.nextInt();\n            if (p < minP) minP = p;\n            else if (p - minP > maxP) maxP = p - minP;\n        }\n        System.out.println(maxP);\n    }\n}\n"
    }'::jsonb
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.test_cases (question_id, input, expected_output, is_hidden, order_index) VALUES
(q3_id, '7 1 5 3 6 4', '5', false, 1),
(q3_id, '7 6 4 3 1', '0', false, 2),
(q3_id, '2 4 1', '2', true, 3),
(q3_id, '3 2 6 5 0 3', '4', true, 4);

-- QUESTION 4: Container With Most Water
INSERT INTO public.questions (
    id, code, title, description, constraints, examples, explanation,
    difficulty, topic, pattern, company_tags, status, starter_templates
) VALUES (
    q4_id,
    'CONTAINER-WITH-MOST-WATER',
    'Container With Most Water',
    'Find two lines that together with the x-axis form a container holding the maximum amount of water.',
    '2 <= n <= 10^5
0 <= height[i] <= 10^4',
    '[{"input": "1 8 6 2 5 4 8 3 7", "output": "49", "explanation": "Width 7, min height 7 => 49"}]'::jsonb,
    '### Two Pointers

Move the shorter pointer inward at each step.',
    'Medium',
    'Arrays',
    'Two Pointers',
    ARRAY['Google', 'Amazon', 'Facebook'],
    'Published',
    '{
        "python": "import sys\ndef max_area(height):\n    l, r, ans = 0, len(height) - 1, 0\n    while l < r:\n        ans = max(ans, (r - l) * min(height[l], height[r]))\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return ans\nif __name__ == \"__main__\":\n    line = sys.stdin.read().strip()\n    if line:\n        h = list(map(int, line.split()))\n        print(max_area(h))\n",
        "javascript": "const fs = require(''fs'');\nconst line = fs.readFileSync(0, ''utf-8'').trim();\nif (line) {\n    const h = line.split(/\\s+/).map(Number);\n    let l = 0, r = h.length - 1, ans = 0;\n    while (l < r) {\n        ans = Math.max(ans, (r - l) * Math.min(h[l], h[r]));\n        if (h[l] < h[r]) l++; else r--;\n    }\n    console.log(ans);\n}\n",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> h; int v;\n    while (cin >> v) h.push_back(v);\n    int l = 0, r = (int)h.size() - 1, ans = 0;\n    while (l < r) {\n        ans = max(ans, (r - l) * min(h[l], h[r]));\n        if (h[l] < h[r]) l++; else r--;\n    }\n    cout << ans << \"\\n\";\n    return 0;\n}\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while (sc.hasNextInt()) list.add(sc.nextInt());\n        int l = 0, r = list.size() - 1, ans = 0;\n        while (l < r) {\n            int area = (r - l) * Math.min(list.get(l), list.get(r));\n            ans = Math.max(ans, area);\n            if (list.get(l) < list.get(r)) l++; else r--;\n        }\n        System.out.println(ans);\n    }\n}\n"
    }'::jsonb
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.test_cases (question_id, input, expected_output, is_hidden, order_index) VALUES
(q4_id, '1 8 6 2 5 4 8 3 7', '49', false, 1),
(q4_id, '1 1', '1', false, 2),
(q4_id, '4 3 2 1 4', '16', true, 3);

-- QUESTION 5: Longest Substring Without Repeating Characters
INSERT INTO public.questions (
    id, code, title, description, constraints, examples, explanation,
    difficulty, topic, pattern, company_tags, status, starter_templates
) VALUES (
    q5_id,
    'LONGEST-SUBSTRING-NO-REPEAT',
    'Longest Substring Without Repeating Characters',
    'Given a string s, find the length of the longest substring without duplicate characters.',
    '0 <= s.length <= 5 * 10^4',
    '[{"input": "abcabcbb", "output": "3", "explanation": "abc length 3"}, {"input": "bbbbb", "output": "1", "explanation": "b length 1"}]'::jsonb,
    '### Sliding Window

Maintain left pointer and map of last seen indices.',
    'Medium',
    'Strings',
    'Sliding Window',
    ARRAY['Amazon', 'Microsoft', 'Facebook'],
    'Published',
    '{
        "python": "import sys\ndef length_of_longest_substring(s: str) -> int:\n    seen = {}\n    l, ans = 0, 0\n    for r, c in enumerate(s):\n        if c in seen and seen[c] >= l: l = seen[c] + 1\n        seen[c] = r\n        ans = max(ans, r - l + 1)\n    return ans\nif __name__ == \"__main__\":\n    s = sys.stdin.read().rstrip(\"\\r\\n\")\n    print(length_of_longest_substring(s))\n",
        "javascript": "const fs = require(''fs'');\nconst s = fs.readFileSync(0, ''utf-8'').replace(/[\\r\\n]+$/, '''');\nconst seen = new Map();\nlet l = 0, ans = 0;\nfor (let r = 0; r < s.length; r++) {\n    if (seen.has(s[r]) && seen.get(s[r]) >= l) l = seen.get(s[r]) + 1;\n    seen.set(s[r], r);\n    ans = Math.max(ans, r - l + 1);\n}\nconsole.log(ans);\n",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        vector<int> last(256, -1);\n        int l = 0, ans = 0;\n        for (int r = 0; r < (int)s.size(); r++) {\n            if (last[(unsigned char)s[r]] >= l) l = last[(unsigned char)s[r]] + 1;\n            last[(unsigned char)s[r]] = r;\n            ans = max(ans, r - l + 1);\n        }\n        cout << ans << \"\\n\";\n    } else cout << 0 << \"\\n\";\n    return 0;\n}\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : \"\";\n        Map<Character, Integer> seen = new HashMap<>();\n        int l = 0, ans = 0;\n        for (int r = 0; r < s.length(); r++) {\n            char c = s.charAt(r);\n            if (seen.containsKey(c) && seen.get(c) >= l) l = seen.get(c) + 1;\n            seen.put(c, r);\n            ans = Math.max(ans, r - l + 1);\n        }\n        System.out.println(ans);\n    }\n}\n"
    }'::jsonb
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.test_cases (question_id, input, expected_output, is_hidden, order_index) VALUES
(q5_id, 'abcabcbb', '3', false, 1),
(q5_id, 'bbbbb', '1', false, 2),
(q5_id, 'pwwkew', '3', false, 3),
(q5_id, 'dvdf', '3', true, 4);

-- QUESTION 6: Binary Search
INSERT INTO public.questions (
    id, code, title, description, constraints, examples, explanation,
    difficulty, topic, pattern, company_tags, status, starter_templates
) VALUES (
    q6_id,
    'BINARY-SEARCH',
    'Binary Search',
    'Search for target in sorted array nums in O(log n) time. Return index or -1.',
    '1 <= nums.length <= 10^4',
    '[{"input": "-1 0 3 5 9 12\n9", "output": "4", "explanation": "9 is at index 4"}]'::jsonb,
    '### Binary Search

Divide search space in half each iteration.',
    'Easy',
    'Binary Search',
    'Divide and Conquer',
    ARRAY['Google', 'Microsoft', 'Apple'],
    'Published',
    '{
        "python": "import sys\ndef search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: l = mid + 1\n        else: r = mid - 1\n    return -1\nif __name__ == \"__main__\":\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        nums = list(map(int, lines[0].strip().split()))\n        target = int(lines[1].strip())\n        print(search(nums, target))\n",
        "javascript": "const fs = require(''fs'');\nconst lines = fs.readFileSync(0, ''utf-8'').trim().split(''\\n'');\nif (lines.length >= 2) {\n    const nums = lines[0].trim().split(/\\s+/).map(Number);\n    const target = Number(lines[1].trim());\n    let l = 0, r = nums.length - 1, ans = -1;\n    while (l <= r) {\n        const mid = Math.floor((l + r) / 2);\n        if (nums[mid] === target) { ans = mid; break; }\n        else if (nums[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    console.log(ans);\n}\n",
        "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\nint main() {\n    string l1, l2;\n    if (getline(cin, l1) && getline(cin, l2)) {\n        stringstream ss(l1);\n        vector<int> nums;\n        int v, target = stoi(l2);\n        while (ss >> v) nums.push_back(v);\n        int l = 0, r = (int)nums.size() - 1, ans = -1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) { ans = mid; break; }\n            else if (nums[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        cout << ans << \"\\n\";\n    }\n    return 0;\n}\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n            int[] nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n            int target = sc.nextInt();\n            int l = 0, r = nums.length - 1, ans = -1;\n            while (l <= r) {\n                int mid = l + (r - l) / 2;\n                if (nums[mid] == target) { ans = mid; break; }\n                else if (nums[mid] < target) l = mid + 1;\n                else r = mid - 1;\n            }\n            System.out.println(ans);\n        }\n    }\n}\n"
    }'::jsonb
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.test_cases (question_id, input, expected_output, is_hidden, order_index) VALUES
(q6_id, E'-1 0 3 5 9 12\n9', '4', false, 1),
(q6_id, E'-1 0 3 5 9 12\n2', '-1', false, 2),
(q6_id, E'5\n5', '0', true, 3);

-- QUESTION 7: Coin Change
INSERT INTO public.questions (
    id, code, title, description, constraints, examples, explanation,
    difficulty, topic, pattern, company_tags, status, starter_templates
) VALUES (
    q7_id,
    'COIN-CHANGE',
    'Coin Change',
    'Given coins of different denominations and total amount, return fewest coins to make up the amount. Return -1 if impossible.',
    '1 <= coins.length <= 12
0 <= amount <= 10^4',
    '[{"input": "1 2 5\n11", "output": "3", "explanation": "11 = 5 + 5 + 1"}]'::jsonb,
    '### Dynamic Programming

dp[i] = min coins for amount i.',
    'Medium',
    'Dynamic Programming',
    'Knapsack',
    ARRAY['Amazon', 'Goldman Sachs', 'Microsoft'],
    'Published',
    '{
        "python": "import sys\ndef coin_change(coins, amount):\n    dp = [float(\"inf\")] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for i in range(c, amount + 1):\n            dp[i] = min(dp[i], dp[i - c] + 1)\n    return dp[amount] if dp[amount] != float(\"inf\") else -1\nif __name__ == \"__main__\":\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        coins = list(map(int, lines[0].strip().split()))\n        amount = int(lines[1].strip())\n        print(coin_change(coins, amount))\n",
        "javascript": "const fs = require(''fs'');\nconst lines = fs.readFileSync(0, ''utf-8'').trim().split(''\\n'');\nif (lines.length >= 2) {\n    const coins = lines[0].trim().split(/\\s+/).map(Number);\n    const amount = Number(lines[1].trim());\n    const dp = new Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    for (const c of coins) {\n        for (let i = c; i <= amount; i++) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n    }\n    console.log(dp[amount] === Infinity ? -1 : dp[amount]);\n}\n",
        "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\nint main() {\n    string l1, l2;\n    if (getline(cin, l1) && getline(cin, l2)) {\n        stringstream ss(l1);\n        vector<int> coins; int c, amount = stoi(l2);\n        while (ss >> c) coins.push_back(c);\n        vector<int> dp(amount + 1, 1e9);\n        dp[0] = 0;\n        for (int coin : coins) {\n            for (int i = coin; i <= amount; i++) dp[i] = min(dp[i], dp[i - coin] + 1);\n        }\n        cout << (dp[amount] >= 1e9 ? -1 : dp[amount]) << \"\\n\";\n    }\n    return 0;\n}\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n            int[] coins = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) coins[i] = Integer.parseInt(parts[i]);\n            int amount = sc.nextInt();\n            int[] dp = new int[amount + 1];\n            Arrays.fill(dp, 1000000);\n            dp[0] = 0;\n            for (int coin : coins) {\n                for (int i = coin; i <= amount; i++) dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n            }\n            System.out.println(dp[amount] >= 1000000 ? -1 : dp[amount]);\n        }\n    }\n}\n"
    }'::jsonb
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.test_cases (question_id, input, expected_output, is_hidden, order_index) VALUES
(q7_id, E'1 2 5\n11', '3', false, 1),
(q7_id, E'2\n3', '-1', false, 2),
(q7_id, E'1\n0', '0', false, 3),
(q7_id, E'186 419 83 408\n6249', '20', true, 4);

-- QUESTION 8: Trapping Rain Water
INSERT INTO public.questions (
    id, code, title, description, constraints, examples, explanation,
    difficulty, topic, pattern, company_tags, status, starter_templates
) VALUES (
    q8_id,
    'TRAPPING-RAIN-WATER',
    'Trapping Rain Water',
    'Given n non-negative integers representing elevation map where bar width is 1, compute how much water it can trap.',
    '1 <= n <= 2 * 10^4
0 <= height[i] <= 10^5',
    '[{"input": "0 1 0 2 1 0 1 3 2 1 2 1", "output": "6", "explanation": "Traps 6 units of water"}]'::jsonb,
    '### Two Pointers

Maintain left_max and right_max, shift the lower boundary.',
    'Hard',
    'Dynamic Programming',
    'Two Pointers',
    ARRAY['Amazon', 'Google', 'Meta'],
    'Published',
    '{
        "python": "import sys\ndef trap(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    l_max, r_max = height[l], height[r]\n    w = 0\n    while l < r:\n        if l_max < r_max:\n            l += 1\n            l_max = max(l_max, height[l])\n            w += l_max - height[l]\n        else:\n            r -= 1\n            r_max = max(r_max, height[r])\n            w += r_max - height[r]\n    return w\nif __name__ == \"__main__\":\n    line = sys.stdin.read().strip()\n    if line:\n        h = list(map(int, line.split()))\n        print(trap(h))\n",
        "javascript": "const fs = require(''fs'');\nconst line = fs.readFileSync(0, ''utf-8'').trim();\nif (line) {\n    const h = line.split(/\\s+/).map(Number);\n    let l = 0, r = h.length - 1, lMax = h[l], rMax = h[r], w = 0;\n    while (l < r) {\n        if (lMax < rMax) { l++; lMax = Math.max(lMax, h[l]); w += lMax - h[l]; }\n        else { r--; rMax = Math.max(rMax, h[r]); w += rMax - h[r]; }\n    }\n    console.log(w);\n}\n",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> h; int v;\n    while (cin >> v) h.push_back(v);\n    if (h.empty()) { cout << 0 << \"\\n\"; return 0; }\n    int l = 0, r = (int)h.size() - 1, lMax = h[l], rMax = h[r];\n    long long w = 0;\n    while (l < r) {\n        if (lMax < rMax) { l++; lMax = max(lMax, h[l]); w += lMax - h[l]; }\n        else { r--; rMax = max(rMax, h[r]); w += rMax - h[r]; }\n    }\n    cout << w << \"\\n\";\n    return 0;\n}\n",
        "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        List<Integer> list = new ArrayList<>();\n        while (sc.hasNextInt()) list.add(sc.nextInt());\n        if (list.isEmpty()) { System.out.println(0); return; }\n        int l = 0, r = list.size() - 1, lMax = list.get(l), rMax = list.get(r);\n        long w = 0;\n        while (l < r) {\n            if (lMax < rMax) { l++; lMax = Math.max(lMax, list.get(l)); w += lMax - list.get(l); }\n            else { r--; rMax = Math.max(rMax, list.get(r)); w += rMax - list.get(r); }\n        }\n        System.out.println(w);\n    }\n}\n"
    }'::jsonb
) ON CONFLICT (code) DO NOTHING;

INSERT INTO public.test_cases (question_id, input, expected_output, is_hidden, order_index) VALUES
(q8_id, '0 1 0 2 1 0 1 3 2 1 2 1', '6', false, 1),
(q8_id, '4 2 0 3 2 5', '9', false, 2),
(q8_id, '5 4 1 2', '1', true, 3);

END $$;