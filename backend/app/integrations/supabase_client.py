import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from supabase import create_client, Client
from app.core.config import settings


class SupabaseService:
    def __init__(self):
        url = settings.SUPABASE_URL or ""
        key = settings.SUPABASE_ANON_KEY or ""
        
        self.is_mock = (
            not url
            or "placeholder" in url
            or "your-project-id" in url
            or not key
            or "placeholder" in key
            or "your-supabase" in key
        )
        
        self._admin_client: Optional[Client] = None
        self._anon_client: Optional[Client] = None

        if not self.is_mock:
            try:
                self._admin_client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
                )
                self._anon_client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_ANON_KEY
                )
            except Exception:
                self.is_mock = True

        # In-memory mock store for local dev / offline testing
        self._mock_users: Dict[str, Dict[str, Any]] = {}
        self._mock_profiles: Dict[str, Dict[str, Any]] = {}
        self._mock_questions: Dict[str, Dict[str, Any]] = {}
        self._mock_test_cases: List[Dict[str, Any]] = []
        self._mock_drafts: Dict[str, Dict[str, Any]] = {}
        self._mock_submissions: List[Dict[str, Any]] = []
        self._mock_progress: Dict[str, Dict[str, Any]] = {}
        self._mock_bookmarks: Dict[str, Dict[str, Any]] = {}
        self._mock_notes: Dict[str, Dict[str, Any]] = {}
        self._mock_revisions: Dict[str, Dict[str, Any]] = {}
        
        self._init_seed_mock_data()

    def _init_seed_mock_data(self):
        """Seeds standard initial questions and admin for offline/mock development mode"""
        admin_id = "00000000-0000-0000-0000-000000000001"
        self._mock_profiles[admin_id] = {
            "id": admin_id,
            "email": "admin@dsatracker.dev",
            "role": "admin",
            "default_language": "python",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        self._mock_users["admin@dsatracker.dev"] = {
            "id": admin_id,
            "password": "Admin123!",
            "profile": self._mock_profiles[admin_id]
        }

        # Seed initial questions
        seed_questions = [
            {
                "id": "a0000000-0000-0000-0000-000000000001",
                "code": "TWO-SUM",
                "title": "Two Sum",
                "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order (represented as space-separated integers).",
                "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
                "examples": [
                    {"input": "2 7 11 15\n9", "output": "0 1", "explanation": "Because nums[0] + nums[1] == 9, return 0 1."},
                    {"input": "3 2 4\n6", "output": "1 2", "explanation": "Because nums[1] + nums[2] == 6, return 1 2."},
                    {"input": "3 3\n6", "output": "0 1", "explanation": "Because nums[0] + nums[1] == 6, return 0 1."}
                ],
                "explanation": "### Optimal Approach (Hash Map)\n\nWe can solve this in O(n) time using a hash table to store the value and its index.\nFor each element `x`, check if `target - x` exists in the hash map. If it does, return the stored index and current index.",
                "difficulty": "Easy",
                "topic": "Arrays",
                "pattern": "Hashing",
                "company_tags": ["Google", "Amazon", "Meta", "Apple", "Microsoft"],
                "status": "Published",
                "starter_templates": {
                    "python": "import sys\n\ndef two_sum(nums, target):\n    # TODO: Implement your solution\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return f\"{seen[comp]} {i}\"\n        seen[num] = i\n    return \"\"\n\nif __name__ == \"__main__\":\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        nums = list(map(int, lines[0].strip().split()))\n        target = int(lines[1].strip())\n        print(two_sum(nums, target))\n",
                    "javascript": "const fs = require('fs');\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const comp = target - nums[i];\n        if (map.has(comp)) return `${map.get(comp)} ${i}`;\n        map.set(nums[i], i);\n    }\n    return '';\n}\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n    const nums = input[0].trim().split(/\\s+/).map(Number);\n    const target = Number(input[1].trim());\n    console.log(twoSum(nums, target));\n}\n",
                    "cpp": "#include <iostream>\n#include <vector>\n#include <sstream>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    string l1, l2;\n    if (getline(cin, l1) && getline(cin, l2)) {\n        stringstream ss(l1);\n        vector<int> nums;\n        int v, target = stoi(l2);\n        while (ss >> v) nums.push_back(v);\n        unordered_map<int, int> seen;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            int comp = target - nums[i];\n            if (seen.count(comp)) {\n                cout << seen[comp] << \" \" << i << \"\\n\";\n                return 0;\n            }\n            seen[nums[i]] = i;\n        }\n    }\n    return 0;\n}\n",
                    "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            String[] parts = sc.nextLine().trim().split(\"\\\\s+\");\n            int[] nums = new int[parts.length];\n            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n            int target = sc.nextInt();\n            Map<Integer, Integer> seen = new HashMap<>();\n            for (int i = 0; i < nums.length; i++) {\n                int comp = target - nums[i];\n                if (seen.containsKey(comp)) {\n                    System.out.println(seen.get(comp) + \" \" + i);\n                    return;\n                }\n                seen.put(nums[i], i);\n            }\n        }\n    }\n}\n"
                },
                "created_by": admin_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "a0000000-0000-0000-0000-000000000002",
                "code": "VALID-PARENTHESES",
                "title": "Valid Parentheses",
                "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
                "constraints": "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
                "examples": [
                    {"input": "()", "output": "true", "explanation": "Simple pair matching."},
                    {"input": "()[]{}\", \"output\": \"true\", \"explanation\": \"All pairs matched in correct order."},
                    {"input": "(]", "output": "false", "explanation": "Mismatched bracket types."}
                ],
                "explanation": "### Stack Approach\n\nPush open brackets onto a stack. When a closing bracket is encountered, pop the top element and verify it matches.",
                "difficulty": "Easy",
                "topic": "Stack",
                "pattern": "Stack Pattern",
                "company_tags": ["Amazon", "Facebook", "Bloomberg", "Microsoft"],
                "status": "Published",
                "starter_templates": {
                    "python": "import sys\ndef is_valid(s: str) -> bool:\n    st = []\n    mp = {\")\": \"(\", \"}\": \"{\", \"]\": \"[\"}\n    for c in s:\n        if c in mp:\n            top = st.pop() if st else \"#\"\n            if mp[c] != top: return False\n        else: st.append(c)\n    return not st\nif __name__ == \"__main__\":\n    s = sys.stdin.read().strip()\n    print(str(is_valid(s)).lower())\n",
                    "javascript": "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\nconst st = [], mp = {')': '(', '}': '{', ']': '['};\nlet ok = true;\nfor (const c of s) {\n    if (mp[c]) {\n        const top = st.length ? st.pop() : '#';\n        if (mp[c] !== top) { ok = false; break; }\n    } else st.push(c);\n}\nconsole.log((ok && st.length === 0) ? 'true' : 'false');\n"
                },
                "created_by": admin_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "a0000000-0000-0000-0000-000000000003",
                "code": "BEST-TIME-BUY-SELL-STOCK",
                "title": "Best Time to Buy and Sell Stock",
                "description": "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day.\n\nReturn the maximum profit you can achieve from a single transaction (buy one, sell one). If you cannot achieve any profit, return `0`.",
                "constraints": "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
                "examples": [
                    {"input": "7 1 5 3 6 4", "output": "5", "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 5."}
                ],
                "explanation": "### Single Pass Greedy\n\nTrack min price so far and maximum difference.",
                "difficulty": "Easy",
                "topic": "Arrays",
                "pattern": "Greedy",
                "company_tags": ["Amazon", "Facebook", "Google", "Microsoft"],
                "status": "Published",
                "starter_templates": {
                    "python": "import sys\ndef max_profit(prices):\n    min_p, max_p = float('inf'), 0\n    for p in prices:\n        if p < min_p: min_p = p\n        elif p - min_p > max_p: max_p = p - min_p\n    return max_p\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    if line:\n        prices = list(map(int, line.split()))\n        print(max_profit(prices))\n"
                },
                "created_by": admin_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "a0000000-0000-0000-0000-000000000004",
                "code": "CONTAINER-WITH-MOST-WATER",
                "title": "Container With Most Water",
                "description": "Given n non-negative integers representing heights of vertical lines, find two lines that form a container holding the maximum amount of water.",
                "constraints": "2 <= n <= 10^5\n0 <= height[i] <= 10^4",
                "examples": [
                    {"input": "1 8 6 2 5 4 8 3 7", "output": "49", "explanation": "Max area between index 1 and 8 is 49."}
                ],
                "explanation": "### Two Pointers\n\nMove the pointer with smaller height inwards.",
                "difficulty": "Medium",
                "topic": "Arrays",
                "pattern": "Two Pointers",
                "company_tags": ["Google", "Amazon", "Facebook"],
                "status": "Published",
                "starter_templates": {
                    "python": "import sys\ndef max_area(height):\n    l, r, ans = 0, len(height) - 1, 0\n    while l < r:\n        ans = max(ans, (r - l) * min(height[l], height[r]))\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return ans\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    if line:\n        h = list(map(int, line.split()))\n        print(max_area(h))\n"
                },
                "created_by": admin_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "a0000000-0000-0000-0000-000000000005",
                "code": "LONGEST-SUBSTRING-NO-REPEAT",
                "title": "Longest Substring Without Repeating Characters",
                "description": "Given a string `s`, find the length of the longest substring without duplicate characters.",
                "constraints": "0 <= s.length <= 5 * 10^4",
                "examples": [
                    {"input": "abcabcbb", "output": "3", "explanation": "The answer is 'abc', length 3."}
                ],
                "explanation": "### Sliding Window\n\nMaintain window [l, r] and store last index of each char.",
                "difficulty": "Medium",
                "topic": "Strings",
                "pattern": "Sliding Window",
                "company_tags": ["Amazon", "Microsoft", "Facebook"],
                "status": "Published",
                "starter_templates": {
                    "python": "import sys\ndef length_of_longest_substring(s: str) -> int:\n    seen = {}\n    l, ans = 0, 0\n    for r, c in enumerate(s):\n        if c in seen and seen[c] >= l: l = seen[c] + 1\n        seen[c] = r\n        ans = max(ans, r - l + 1)\n    return ans\nif __name__ == '__main__':\n    s = sys.stdin.read().rstrip('\\r\\n')\n    print(length_of_longest_substring(s))\n"
                },
                "created_by": admin_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "a0000000-0000-0000-0000-000000000006",
                "code": "BINARY-SEARCH",
                "title": "Binary Search",
                "description": "Given an array of integers nums sorted in ascending order and a target, search target in nums in O(log n) runtime.",
                "constraints": "1 <= nums.length <= 10^4",
                "examples": [
                    {"input": "-1 0 3 5 9 12\n9", "output": "4", "explanation": "9 exists in nums at index 4."}
                ],
                "explanation": "### Binary Search\n\nDivide and conquer search space.",
                "difficulty": "Easy",
                "topic": "Binary Search",
                "pattern": "Divide and Conquer",
                "company_tags": ["Google", "Microsoft", "Apple"],
                "status": "Published",
                "starter_templates": {
                    "python": "import sys\ndef search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: l = mid + 1\n        else: r = mid - 1\n    return -1\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        nums = list(map(int, lines[0].strip().split()))\n        target = int(lines[1].strip())\n        print(search(nums, target))\n"
                },
                "created_by": admin_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "a0000000-0000-0000-0000-000000000007",
                "code": "COIN-CHANGE",
                "title": "Coin Change",
                "description": "Given coins of different denominations and a total amount, return the fewest coins needed to make up that amount, or -1 if impossible.",
                "constraints": "1 <= coins.length <= 12\n0 <= amount <= 10^4",
                "examples": [
                    {"input": "1 2 5\n11", "output": "3", "explanation": "11 = 5 + 5 + 1 (3 coins)"}
                ],
                "explanation": "### DP\n\ndp[i] = min coins for amount i.",
                "difficulty": "Medium",
                "topic": "Dynamic Programming",
                "pattern": "Knapsack",
                "company_tags": ["Amazon", "Goldman Sachs", "Microsoft"],
                "status": "Published",
                "starter_templates": {
                    "python": "import sys\ndef coin_change(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for i in range(c, amount + 1):\n            dp[i] = min(dp[i], dp[i - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1\nif __name__ == '__main__':\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        coins = list(map(int, lines[0].strip().split()))\n        amount = int(lines[1].strip())\n        print(coin_change(coins, amount))\n"
                },
                "created_by": admin_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "a0000000-0000-0000-0000-000000000008",
                "code": "TRAPPING-RAIN-WATER",
                "title": "Trapping Rain Water",
                "description": "Given n non-negative integers representing an elevation map where each bar width is 1, compute how much water it can trap after raining.",
                "constraints": "1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
                "examples": [
                    {"input": "0 1 0 2 1 0 1 3 2 1 2 1", "output": "6", "explanation": "Traps 6 units of water."}
                ],
                "explanation": "### Two Pointers\n\nShift pointers inward updating left_max and right_max.",
                "difficulty": "Hard",
                "topic": "Dynamic Programming",
                "pattern": "Two Pointers",
                "company_tags": ["Amazon", "Google", "Meta"],
                "status": "Published",
                "starter_templates": {
                    "python": "import sys\ndef trap(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    l_max, r_max = height[l], height[r]\n    w = 0\n    while l < r:\n        if l_max < r_max:\n            l += 1\n            l_max = max(l_max, height[l])\n            w += l_max - height[l]\n        else:\n            r -= 1\n            r_max = max(r_max, height[r])\n            w += r_max - height[r]\n    return w\nif __name__ == '__main__':\n    line = sys.stdin.read().strip()\n    if line:\n        h = list(map(int, line.split()))\n        print(trap(h))\n"
                },
                "created_by": admin_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        ]

        for q in seed_questions:
            self._mock_questions[q["id"]] = q

        # Seed Test Cases (visible + hidden)
        test_cases_seed = [
            # Two Sum
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000001", "input": "2 7 11 15\n9", "expected_output": "0 1", "is_hidden": False, "order_index": 1},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000001", "input": "3 2 4\n6", "expected_output": "1 2", "is_hidden": False, "order_index": 2},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000001", "input": "3 3\n6", "expected_output": "0 1", "is_hidden": False, "order_index": 3},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000001", "input": "1 5 8 10 14 20\n24", "expected_output": "3 4", "is_hidden": True, "order_index": 4},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000001", "input": "-3 4 3 90\n0", "expected_output": "0 2", "is_hidden": True, "order_index": 5},
            
            # Valid Parentheses
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000002", "input": "()", "expected_output": "true", "is_hidden": False, "order_index": 1},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000002", "input": "()[]{}", "expected_output": "true", "is_hidden": False, "order_index": 2},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000002", "input": "(]", "expected_output": "false", "is_hidden": False, "order_index": 3},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000002", "input": "([{}])", "expected_output": "true", "is_hidden": True, "order_index": 4},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000002", "input": "([)]", "expected_output": "false", "is_hidden": True, "order_index": 5},

            # Stock
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000003", "input": "7 1 5 3 6 4", "expected_output": "5", "is_hidden": False, "order_index": 1},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000003", "input": "7 6 4 3 1", "expected_output": "0", "is_hidden": False, "order_index": 2},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000003", "input": "2 4 1", "expected_output": "2", "is_hidden": True, "order_index": 3},

            # Container Water
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000004", "input": "1 8 6 2 5 4 8 3 7", "expected_output": "49", "is_hidden": False, "order_index": 1},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000004", "input": "1 1", "expected_output": "1", "is_hidden": False, "order_index": 2},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000004", "input": "4 3 2 1 4", "expected_output": "16", "is_hidden": True, "order_index": 3},

            # Substring
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000005", "input": "abcabcbb", "expected_output": "3", "is_hidden": False, "order_index": 1},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000005", "input": "bbbbb", "expected_output": "1", "is_hidden": False, "order_index": 2},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000005", "input": "dvdf", "expected_output": "3", "is_hidden": True, "order_index": 3},

            # Binary Search
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000006", "input": "-1 0 3 5 9 12\n9", "expected_output": "4", "is_hidden": False, "order_index": 1},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000006", "input": "-1 0 3 5 9 12\n2", "expected_output": "-1", "is_hidden": False, "order_index": 2},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000006", "input": "5\n5", "expected_output": "0", "is_hidden": True, "order_index": 3},

            # Coin Change
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000007", "input": "1 2 5\n11", "expected_output": "3", "is_hidden": False, "order_index": 1},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000007", "input": "2\n3", "expected_output": "-1", "is_hidden": False, "order_index": 2},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000007", "input": "186 419 83 408\n6249", "expected_output": "20", "is_hidden": True, "order_index": 3},

            # Trapping Rain Water
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000008", "input": "0 1 0 2 1 0 1 3 2 1 2 1", "expected_output": "6", "is_hidden": False, "order_index": 1},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000008", "input": "4 2 0 3 2 5", "expected_output": "9", "is_hidden": False, "order_index": 2},
            {"id": str(uuid.uuid4()), "question_id": "a0000000-0000-0000-0000-000000000008", "input": "5 4 1 2", "expected_output": "1", "is_hidden": True, "order_index": 3}
        ]

        self._mock_test_cases.extend(test_cases_seed)


supabase_service = SupabaseService()