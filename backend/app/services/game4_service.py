import json
import os
import random
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

# ---------------------------------------------------------
# STAGE 1: The Fully Formatted GfG Database
# ---------------------------------------------------------
GFG_DB = {
    "easy": [
        {"id": "e1", "type": "mcq", "category": "Math", "difficulty": "easy", "questionText": "A bat and a ball cost $1.10. The bat costs $1.00 more than the ball. How much does the ball cost?", "options": [{"id": "a", "text": "$0.10"}, {"id": "b", "text": "$0.05"}, {"id": "c", "text": "$1.00"}, {"id": "d", "text": "$0.50"}], "correct_id": "b", "trap_id": "a"},
        {"id": "e2", "type": "mcq", "category": "Pattern", "difficulty": "easy", "questionText": "A lily pad patch doubles every day. It takes 48 days to cover the lake. How long to cover half?", "options": [{"id": "a", "text": "24 days"}, {"id": "b", "text": "47 days"}, {"id": "c", "text": "12 days"}, {"id": "d", "text": "46 days"}], "correct_id": "b", "trap_id": "a"},
        {"id": "e3", "type": "mcq", "category": "Logic", "difficulty": "easy", "questionText": "You are running a race and overtake second place. What place are you in?", "options": [{"id": "a", "text": "First place"}, {"id": "b", "text": "Second place"}, {"id": "c", "text": "Third place"}, {"id": "d", "text": "Last place"}], "correct_id": "b", "trap_id": "a"},
        {"id": "e4", "type": "mcq", "category": "Math", "difficulty": "easy", "questionText": "5 machines make 5 widgets in 5 minutes. How long for 100 machines to make 100 widgets?", "options": [{"id": "a", "text": "100 minutes"}, {"id": "b", "text": "50 minutes"}, {"id": "c", "text": "5 minutes"}, {"id": "d", "text": "1 minute"}], "correct_id": "c", "trap_id": "a"},
        {"id": "e5", "type": "mcq", "category": "Logic", "difficulty": "easy", "questionText": "Some months have 31 days, others 30. How many have 28?", "options": [{"id": "a", "text": "1 (February)"}, {"id": "b", "text": "Every 4 years"}, {"id": "c", "text": "12 (All of them)"}, {"id": "d", "text": "6"}], "correct_id": "c", "trap_id": "a"},
        {"id": "e6", "type": "mcq", "category": "Math", "difficulty": "easy", "questionText": "Divide 30 by half and add 10.", "options": [{"id": "a", "text": "25"}, {"id": "b", "text": "70"}, {"id": "c", "text": "40"}, {"id": "d", "text": "15"}], "correct_id": "b", "trap_id": "a"},
        {"id": "e7", "type": "mcq", "category": "Lateral", "difficulty": "easy", "questionText": "Two US coins total 55 cents. One is NOT a nickel. What are they?", "options": [{"id": "a", "text": "Impossible"}, {"id": "b", "text": "A 50-cent piece and a nickel"}, {"id": "c", "text": "Two quarters and a penny"}, {"id": "d", "text": "A silver dollar cut in half"}], "correct_id": "b", "trap_id": "a"},
        {"id": "e8", "type": "mcq", "category": "Math", "difficulty": "easy", "questionText": "A doctor gives you 3 pills, take one every half hour. How long do they last?", "options": [{"id": "a", "text": "1.5 hours"}, {"id": "b", "text": "1 hour"}, {"id": "c", "text": "2 hours"}, {"id": "d", "text": "3 hours"}], "correct_id": "b", "trap_id": "a"},
        {"id": "e9", "type": "mcq", "category": "Logic", "difficulty": "easy", "questionText": "You have 3 apples. You take away 2. How many do you have?", "options": [{"id": "a", "text": "1"}, {"id": "b", "text": "2"}, {"id": "c", "text": "3"}, {"id": "d", "text": "0"}], "correct_id": "b", "trap_id": "a"},
        {"id": "e10", "type": "mcq", "category": "Pattern", "difficulty": "easy", "questionText": "How many times does '9' appear from 1 to 100?", "options": [{"id": "a", "text": "10"}, {"id": "b", "text": "19"}, {"id": "c", "text": "20"}, {"id": "d", "text": "11"}], "correct_id": "c", "trap_id": "b"},
        {"id": "e11", "type": "mcq", "category": "Logic", "difficulty": "easy", "questionText": "A farmer has 17 sheep. All but 9 die. How many are left?", "options": [{"id": "a", "text": "8"}, {"id": "b", "text": "9"}, {"id": "c", "text": "17"}, {"id": "d", "text": "0"}], "correct_id": "b", "trap_id": "a"},
        {"id": "e12", "type": "mcq", "category": "Lateral", "difficulty": "easy", "questionText": "Mary's father has 5 daughters: Nana, Nene, Nini, Nono. What is the 5th?", "options": [{"id": "a", "text": "Nunu"}, {"id": "b", "text": "Mary"}, {"id": "c", "text": "Nina"}, {"id": "d", "text": "Nano"}], "correct_id": "b", "trap_id": "a"},
        {"id": "e13", "type": "mcq", "category": "Logic", "difficulty": "easy", "questionText": "If a plane crashes on the US-Canada border, where do they bury the survivors?", "options": [{"id": "a", "text": "US"}, {"id": "b", "text": "Canada"}, {"id": "c", "text": "They don't bury survivors"}, {"id": "d", "text": "In a neutral zone"}], "correct_id": "c", "trap_id": "a"},
        {"id": "e14", "type": "mcq", "category": "Math", "difficulty": "easy", "questionText": "What is the next number: 1, 1, 2, 3, 5, 8, ...", "options": [{"id": "a", "text": "13"}, {"id": "b", "text": "11"}, {"id": "c", "text": "12"}, {"id": "d", "text": "10"}], "correct_id": "a", "trap_id": "c"},
        {"id": "e15", "type": "mcq", "category": "Lateral", "difficulty": "easy", "questionText": "What has keys but can't open locks?", "options": [{"id": "a", "text": "A piano"}, {"id": "b", "text": "A map"}, {"id": "c", "text": "A cryptographer"}, {"id": "d", "text": "A monkey"}], "correct_id": "a", "trap_id": "c"}
    ],
    "medium": [
        {"id": "m1", "type": "mcq", "category": "Optimization", "difficulty": "medium", "questionText": "You have 9 identical marbles, 1 is heavier. Minimum weighings on a balance scale to find it?", "options": [{"id": "a", "text": "4"}, {"id": "b", "text": "3"}, {"id": "c", "text": "2"}, {"id": "d", "text": "1"}], "correct_id": "c", "trap_id": "b"},
        {"id": "m2", "type": "mcq", "category": "Time", "difficulty": "medium", "questionText": "You have a 3L and 5L jug. Measure exactly 4L.", "options": [{"id": "a", "text": "Fill 5L, pour to 3L. Dump 3L. Pour 2L to 3L. Fill 5L, pour 1L to 3L."}, {"id": "b", "text": "Fill 3L, pour to 5L. Fill 3L, top off 5L. The 3L has 4L."}, {"id": "c", "text": "Guess visually."}, {"id": "d", "text": "Fill 5L, pour to 3L. 5L holds 4L."}], "correct_id": "a", "trap_id": "d"},
        {"id": "m3", "type": "mcq", "category": "Geometry", "difficulty": "medium", "questionText": "Exact angle between hour and minute hands at 3:15?", "options": [{"id": "a", "text": "0 degrees"}, {"id": "b", "text": "7.5 degrees"}, {"id": "c", "text": "15 degrees"}, {"id": "d", "text": "3.5 degrees"}], "correct_id": "b", "trap_id": "a"},
        {"id": "m4", "type": "mcq", "category": "Probability", "difficulty": "medium", "questionText": "Biased coin (70% Heads). Simulate a 50/50 fair toss.", "options": [{"id": "a", "text": "Flip 10 times, take majority."}, {"id": "b", "text": "Flip twice. HT = P1, TH = P2. HH/TT = re-flip."}, {"id": "c", "text": "Flip twice. HH/TT = P1, HT/TH = P2."}, {"id": "d", "text": "Impossible."}], "correct_id": "b", "trap_id": "c"},
        {"id": "m5", "type": "mcq", "category": "Logic", "difficulty": "medium", "questionText": "Snail in a 30ft well. Climbs 3ft a day, slips 2ft at night. Days to escape?", "options": [{"id": "a", "text": "30 days"}, {"id": "b", "text": "29 days"}, {"id": "c", "text": "28 days"}, {"id": "d", "text": "15 days"}], "correct_id": "c", "trap_id": "a"},
        {"id": "m6", "type": "mcq", "category": "Optimization", "difficulty": "medium", "questionText": "2 identical glass balls, 100-story building. Find break floor. Most efficient max drops?", "options": [{"id": "a", "text": "50"}, {"id": "b", "text": "14"}, {"id": "c", "text": "10"}, {"id": "d", "text": "20"}], "correct_id": "b", "trap_id": "c"},
        {"id": "m7", "type": "mcq", "category": "Time", "difficulty": "medium", "questionText": "Measure 45 mins with two 1-hour unevenly burning wires.", "options": [{"id": "a", "text": "Light W1 both ends, W2 one end. When W1 done, light other end of W2."}, {"id": "b", "text": "Light both at one end, wait 45m."}, {"id": "c", "text": "Cut one in half."}, {"id": "d", "text": "Light W1. When done, light W2 halfway."}], "correct_id": "a", "trap_id": "c"},
        {"id": "m8", "type": "mcq", "category": "Math", "difficulty": "medium", "questionText": "Party of 10. Everyone shakes hands exactly once. Total handshakes?", "options": [{"id": "a", "text": "100"}, {"id": "b", "text": "90"}, {"id": "c", "text": "45"}, {"id": "d", "text": "50"}], "correct_id": "c", "trap_id": "a"},
        {"id": "m9", "type": "mcq", "category": "Optimization", "difficulty": "medium", "questionText": "4 people cross a bridge at night. Speeds: 1, 2, 5, 10 mins. 1 flashlight. Max 2 crossing at slower speed. Min time?", "options": [{"id": "a", "text": "19 mins"}, {"id": "b", "text": "17 mins"}, {"id": "c", "text": "21 mins"}, {"id": "d", "text": "15 mins"}], "correct_id": "b", "trap_id": "a"},
        {"id": "m10", "type": "mcq", "category": "Time", "difficulty": "medium", "questionText": "You have a 7-min and 11-min hourglass. Time exactly 15 mins.", "options": [{"id": "a", "text": "Run 11 twice, subtract 7."}, {"id": "b", "text": "Start both. When 7 ends, start timer. When 11 ends, flip 11. When 11 ends, 15m done."}, {"id": "c", "text": "Flip 7 twice, add 1."}, {"id": "d", "text": "Impossible."}], "correct_id": "b", "trap_id": "a"},
        {"id": "m11", "type": "mcq", "category": "Probability", "difficulty": "medium", "questionText": "Monty Hall: 3 doors. You pick D1. Host opens D3 (goat). Do you switch to D2?", "options": [{"id": "a", "text": "Yes, it doubles your win probability."}, {"id": "b", "text": "No, it's a 50/50 chance now."}, {"id": "c", "text": "Doesn't matter."}, {"id": "d", "text": "No, stick to your gut."}], "correct_id": "a", "trap_id": "b"},
        {"id": "m12", "type": "mcq", "category": "Logic", "difficulty": "medium", "questionText": "Two doors (Heaven/Hell). Two guards (One lies, one tells truth). You get 1 question. What do you ask?", "options": [{"id": "a", "text": "Are you a liar?"}, {"id": "b", "text": "Which door goes to heaven?"}, {"id": "c", "text": "Which door would the other guard say leads to heaven? (Then pick the opposite)"}, {"id": "d", "text": "Is the sky blue?"}], "correct_id": "c", "trap_id": "b"},
        {"id": "m13", "type": "mcq", "category": "Math", "difficulty": "medium", "questionText": "Cut a round cake into 8 equal pieces with exactly 3 straight cuts.", "options": [{"id": "a", "text": "2 vertical, 1 horizontal"}, {"id": "b", "text": "Make a cross, then cut horizontally through the middle."}, {"id": "c", "text": "3 parallel cuts"}, {"id": "d", "text": "Impossible"}], "correct_id": "b", "trap_id": "a"},
        {"id": "m14", "type": "mcq", "category": "Lateral", "difficulty": "medium", "questionText": "Farmer needs to cross river with wolf, goat, cabbage. Boat holds 1 item. Wolf eats goat, goat eats cabbage. How?", "options": [{"id": "a", "text": "Take goat. Return. Take wolf. Return with goat. Take cabbage. Return. Take goat."}, {"id": "b", "text": "Take wolf. Take cabbage. Take goat."}, {"id": "c", "text": "Leave the cabbage."}, {"id": "d", "text": "Take wolf and cabbage together."}], "correct_id": "a", "trap_id": "b"},
        {"id": "m15", "type": "mcq", "category": "Math", "difficulty": "medium", "questionText": "Digital clock (12hr). How many times a day do hands perfectly overlap?", "options": [{"id": "a", "text": "24"}, {"id": "b", "text": "22"}, {"id": "c", "text": "12"}, {"id": "d", "text": "11"}], "correct_id": "b", "trap_id": "a"},
        {"id": "m16", "type": "mcq", "category": "Optimization", "difficulty": "medium", "questionText": "10 boxes of pills. 9 have 10g pills, 1 has 9g pills. Digital scale. Find the 9g box in 1 weighing.", "options": [{"id": "a", "text": "Weigh them all together."}, {"id": "b", "text": "Take 1 pill from Box 1, 2 from Box 2... 10 from Box 10. Weigh the subset."}, {"id": "c", "text": "Impossible."}, {"id": "d", "text": "Weigh half against half."}], "correct_id": "b", "trap_id": "d"},
        {"id": "m17", "type": "mcq", "category": "Logic", "difficulty": "medium", "questionText": "3 guests pay $30 ($10 each). Room is $25. Bellboy keeps $2, gives $1 back to each. They paid $27, bellboy has $2 = $29. Where's the $1?", "options": [{"id": "a", "text": "The bellboy stole it."}, {"id": "b", "text": "Math is wrong. 27 includes the 2. They paid 25 for room + 2 for bellboy."}, {"id": "c", "text": "Taxes."}, {"id": "d", "text": "The manager has it."}], "correct_id": "b", "trap_id": "a"},
        {"id": "m18", "type": "mcq", "category": "Probability", "difficulty": "medium", "questionText": "Probability two people in a room of 23 share a birthday?", "options": [{"id": "a", "text": "10%"}, {"id": "b", "text": "23%"}, {"id": "c", "text": "50.7%"}, {"id": "d", "text": "100%"}], "correct_id": "c", "trap_id": "a"},
        {"id": "m19", "type": "mcq", "category": "Lateral", "difficulty": "medium", "questionText": "Man looks at portrait: 'Brothers and sisters I have none, but that man's father is my father's son.' Who is it?", "options": [{"id": "a", "text": "Himself"}, {"id": "b", "text": "His son"}, {"id": "c", "text": "His father"}, {"id": "d", "text": "His uncle"}], "correct_id": "b", "trap_id": "a"},
        {"id": "m20", "type": "mcq", "category": "Logic", "difficulty": "medium", "questionText": "A barrel of water weighs 50 pounds. What must you add to it to make it weigh 35 pounds?", "options": [{"id": "a", "text": "Helium"}, {"id": "b", "text": "Ice"}, {"id": "c", "text": "A hole"}, {"id": "d", "text": "Anti-gravity water"}], "correct_id": "c", "trap_id": "a"}
    ],
    "hard": [
        {"id": "h1", "type": "mcq", "category": "Probability", "difficulty": "hard", "questionText": "100 coins flat on a table. 10 heads, 90 tails. Blindfolded. Divide into 2 piles with equal heads.", "options": [{"id": "a", "text": "Impossible blindfolded."}, {"id": "b", "text": "Make a pile of 50 and 50."}, {"id": "c", "text": "Make a pile of 10, then flip all 10 coins."}, {"id": "d", "text": "Make a pile of 90, then flip all 90 coins."}], "correct_id": "c", "trap_id": "b"},
        {"id": "h2", "type": "mcq", "category": "Optimization", "difficulty": "hard", "questionText": "25 horses, race 5 at a time. No stopwatch. Minimum races to find top 3?", "options": [{"id": "a", "text": "6"}, {"id": "b", "text": "5"}, {"id": "c", "text": "7"}, {"id": "d", "text": "8"}], "correct_id": "c", "trap_id": "a"},
        {"id": "h3", "type": "mcq", "category": "Lateral", "difficulty": "hard", "questionText": "3 mislabeled jars: Apples, Oranges, Mixed. Pick 1 fruit from 1 jar. Correctly label all.", "options": [{"id": "a", "text": "Pick from Mixed. Whatever it is, that's the label. Deduce the rest."}, {"id": "b", "text": "Pick from Apples."}, {"id": "c", "text": "Pick from Oranges."}, {"id": "d", "text": "Need to pick at least 2."}], "correct_id": "a", "trap_id": "b"},
        {"id": "h4", "type": "mcq", "category": "Logic", "difficulty": "hard", "questionText": "100 doors closed. Toggle every door, then every 2nd, then 3rd, up to 100th pass. Which remain open?", "options": [{"id": "a", "text": "All primes"}, {"id": "b", "text": "All evens"}, {"id": "c", "text": "Perfect squares (1, 4, 9, 16...)"}, {"id": "d", "text": "Door 100"}], "correct_id": "c", "trap_id": "a"},
        {"id": "h5", "type": "mcq", "category": "Game Theory", "difficulty": "hard", "questionText": "5 pirates dividing 100 coins. Oldest proposes split. If >= 50% agree, passes. Else, he dies. Optimal split?", "options": [{"id": "a", "text": "20, 20, 20, 20, 20"}, {"id": "b", "text": "98, 0, 1, 0, 1"}, {"id": "c", "text": "100, 0, 0, 0, 0"}, {"id": "d", "text": "50, 50, 0, 0, 0"}], "correct_id": "b", "trap_id": "a"},
        {"id": "h6", "type": "mcq", "category": "Optimization", "difficulty": "hard", "questionText": "12 identical marbles. 1 is anomalous (heavy OR light). Find it in exactly 3 weighings on a balance scale.", "options": [{"id": "a", "text": "Weigh 6 vs 6, then 3 vs 3."}, {"id": "b", "text": "Weigh 4 vs 4. If equal, it's in the 4 left out. Weigh complex subsets to deduce."}, {"id": "c", "text": "Impossible."}, {"id": "d", "text": "Weigh 3 vs 3 four times."}], "correct_id": "b", "trap_id": "a"},
        {"id": "h7", "type": "mcq", "category": "Logic", "difficulty": "hard", "questionText": "100 prisoners lined up facing forward. Black/white hats. Guess from back to front. Guarantee 99 survive.", "options": [{"id": "a", "text": "Back person says color of person in front."}, {"id": "b", "text": "Back person says 'Black' if odd number of black hats in front, 'White' if even."}, {"id": "c", "text": "Everyone guesses random."}, {"id": "d", "text": "Speak in code."}], "correct_id": "b", "trap_id": "a"},
        {"id": "h8", "type": "mcq", "category": "Optimization", "difficulty": "hard", "questionText": "Camel transporting 3000 bananas across 1000km desert. Max load 1000, eats 1 per km. Max bananas delivered?", "options": [{"id": "a", "text": "0"}, {"id": "b", "text": "833"}, {"id": "c", "text": "533"}, {"id": "d", "text": "1000"}], "correct_id": "c", "trap_id": "b"},
        {"id": "h9", "type": "mcq", "category": "Logic", "difficulty": "hard", "questionText": "1000 bottles of wine. 1 is poisoned (takes 24hrs to kill). You have 10 prisoners and 24 hours. Find poison.", "options": [{"id": "a", "text": "Feed 100 bottles to each."}, {"id": "b", "text": "Feed 1 bottle to each, hope you get lucky."}, {"id": "c", "text": "Use binary numbering. Assign each prisoner a bit position. 10 bits = 1024 combinations."}, {"id": "d", "text": "Impossible."}], "correct_id": "c", "trap_id": "a"},
        {"id": "h10", "type": "mcq", "category": "Logic", "difficulty": "hard", "questionText": "3 gods: True, False, Random. You can ask 3 yes/no questions. They answer 'da'/'ja' (meaning yes/no but unknown).", "options": [{"id": "a", "text": "Ask 'Are you True?'"}, {"id": "b", "text": "Ask nested logical biconditionals to isolate Random first."}, {"id": "c", "text": "Ask 'What does da mean?'"}, {"id": "d", "text": "Impossible."}], "correct_id": "b", "trap_id": "a"},
        {"id": "h11", "type": "mcq", "category": "Probability", "difficulty": "hard", "questionText": "100 passengers board a 100-seat plane. 1st takes random seat. Rest take assigned seat or random if taken. Prob 100th gets right seat?", "options": [{"id": "a", "text": "1%"}, {"id": "b", "text": "50%"}, {"id": "c", "text": "99%"}, {"id": "d", "text": "100%"}], "correct_id": "b", "trap_id": "a"},
        {"id": "h12", "type": "mcq", "category": "Logic", "difficulty": "hard", "questionText": "100 logical green-eyed prisoners. Can't communicate. Dictator: 'At least one has green eyes'. When do they leave?", "options": [{"id": "a", "text": "Day 1"}, {"id": "b", "text": "Day 50"}, {"id": "c", "text": "Day 100"}, {"id": "d", "text": "Never"}], "correct_id": "c", "trap_id": "a"},
        {"id": "h13", "type": "mcq", "category": "Probability", "difficulty": "hard", "questionText": "3 ants on an equilateral triangle. Pick random direction. Probability they don't collide?", "options": [{"id": "a", "text": "1/2"}, {"id": "b", "text": "1/4"}, {"id": "c", "text": "1/8"}, {"id": "d", "text": "1/3"}], "correct_id": "b", "trap_id": "a"},
        {"id": "h14", "type": "mcq", "category": "Logic", "difficulty": "hard", "questionText": "Russian Roulette, 6 chambers. 2 consecutive bullets. Spun, clicked empty. Safer to pull again or spin first?", "options": [{"id": "a", "text": "Spin first"}, {"id": "b", "text": "Pull again (probability is 1/4 vs 2/6 for spin)"}, {"id": "c", "text": "Doesn't matter"}, {"id": "d", "text": "Impossible to know"}], "correct_id": "b", "trap_id": "a"},
        {"id": "h15", "type": "mcq", "category": "Logic", "difficulty": "hard", "questionText": "100 prisoners, room with 1 switch. Warden takes them randomly. Devise strategy to announce 'All have visited'.", "options": [{"id": "a", "text": "Designate 1 counter. Others flip switch ON once. Counter flips it OFF and counts to 99."}, {"id": "b", "text": "Everyone turns it on once."}, {"id": "c", "text": "Everyone turns it off once."}, {"id": "d", "text": "Impossible."}], "correct_id": "a", "trap_id": "b"}
    ]
}

# ---------------------------------------------------------
# STAGE 2: Adaptive Engine State Management
# ---------------------------------------------------------
SESSION_STATE = {
    "current_level": "easy",
    "used_ids": set()
}

def initialize_game():
    global SESSION_STATE
    SESSION_STATE = {"current_level": "easy", "used_ids": set()}
    return {
        "totalRounds": 5, # Standard 5 round game
        "startingRating": 50,
        "startingLevel": "easy"
    }

def fetch_question(round_num):
    global SESSION_STATE
    level = SESSION_STATE["current_level"]
    
    # Filter available questions in the current tier
    available = [q for q in GFG_DB[level] if q["id"] not in SESSION_STATE["used_ids"]]
    
    # Auto-promote if they somehow exhaust a tier
    if not available:
        if level == "easy": SESSION_STATE["current_level"] = "medium"
        elif level == "medium": SESSION_STATE["current_level"] = "hard"
        else: return None # Game over, exhausted the bank
        
        level = SESSION_STATE["current_level"]
        available = [q for q in GFG_DB[level] if q["id"] not in SESSION_STATE["used_ids"]]

    selected_q = random.choice(available).copy()
    SESSION_STATE["used_ids"].add(selected_q["id"])
    
    # Strip answers before sending to UI
    selected_q.pop("correct_id", None)
    selected_q.pop("trap_id", None)
    
    # Override difficulty for the final round styling
    if round_num == 5:
        selected_q["difficulty"] = "boss"

    return selected_q

# ---------------------------------------------------------
# STAGE 3: Evaluation & Adaptive Progression
# ---------------------------------------------------------
def evaluate_with_agent(question_id, selected_option, confidence_bet, current_rating):
    global SESSION_STATE
    
    # 1. Find the full question object to get the truth
    question = None
    for tier in GFG_DB.values():
        for q in tier:
            if q["id"] == question_id:
                question = q
                break
                
    if not question:
        raise ValueError("Invalid question ID")

    # 2. Mathematical ground truth
    selected_text = next((opt['text'] for opt in question['options'] if opt['id'] == selected_option), "Unknown")
    is_correct = selected_option == question["correct_id"]
    is_trap = selected_option == question.get("trap_id")

    # 3. AI Evaluation for Feedback Generation
    prompt = f"""
    You are the "Googly Master", an elite Tech Lead interviewing a candidate.
    
    The Puzzle: "{question['questionText']}"
    The Candidate Chose: "{selected_text}"
    
    Context: This answer is strictly {'CORRECT' if is_correct else 'INCORRECT'}. 
    {'This was a TRAP option.' if is_trap else ''}
    
    Your task:
    1. 'trapExplanation': If they hit a trap, explain in 1 sentence why it looked right but is flawed. If they got it right, explain the core logic in 1 sentence.
    2. 'playerInsight': A fair 1-sentence critique or compliment of their logical deduction.
    
    Output ONLY valid JSON matching this schema:
    {{
        "trapExplanation": "string",
        "playerInsight": "string"
    }}
    """

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        
        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        
        ai_data = json.loads(raw_text.strip())
        
    except Exception as e:
        print(f"AI Error: {e}")
        ai_data = {
            "trapExplanation": "Logic verified mathematically.",
            "playerInsight": "Good deductive reasoning." if is_correct else "Review the core constraints of the puzzle."
        }

    # 4. Adaptive Difficulty Logic
    if is_correct:
        if SESSION_STATE["current_level"] == "easy": SESSION_STATE["current_level"] = "medium"
        elif SESSION_STATE["current_level"] == "medium": SESSION_STATE["current_level"] = "hard"
    else:
        if SESSION_STATE["current_level"] == "hard": SESSION_STATE["current_level"] = "medium"
        elif SESSION_STATE["current_level"] == "medium": SESSION_STATE["current_level"] = "easy"

    # 5. Math Logic
    bonus = 50 if (confidence_bet == 3 and is_correct) else 0
    delta = 15 if is_correct else (-20 if is_trap else -5)
    
    return {
        "correctOptionId": question["correct_id"],
        "trapOptionId": question.get("trap_id") if is_trap else None,
        "isCorrect": is_correct,
        "isTrap": is_trap,
        "trapExplanation": ai_data.get("trapExplanation", ""),
        "playerInsight": ai_data.get("playerInsight", ""),
        "ratingDelta": delta,
        "newRating": max(0, min(100, current_rating + delta)),
        "confidenceBonus": bonus,
        "totalXpAwarded": (100 if is_correct else 10) + bonus
    }

def generate_lifeline(question_id, lifeline_type):
    question = None
    for tier in GFG_DB.values():
        for q in tier:
            if q["id"] == question_id:
                question = q
                break
                
    if lifeline_type == '50_50':
        all_ids = [opt['id'] for opt in question['options']]
        wrong_ids = [i for i in all_ids if i != question['correct_id']]
        return {"eliminated": wrong_ids[:2]}
        
    elif lifeline_type == 'hint':
        return {"hintText": "Focus on the mathematical constraints, not the obvious narrative trap."}