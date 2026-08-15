/* ============================================================
   WebToWallStreet — curriculum data
   ------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT TO ADD A DAY.

   Drop Day_3.html next to index.html, then append one object to
   the DAYS array below. The map places the new territory, the
   counters, radar and progress store all pick it up automatically.

   Per day:
     id       short unique key. Used in saved progress — never
              rename one after students have used the site.
     day      the number shown in the pin
     region   one word, uppercase. Shown under the pin
     title    full title of the day
     lede     one or two sentences for the dossier panel
     file     the HTML file to open
     seed     any integer. Changes the island's shape. Pick one
              you like the look of
     x, y     OPTIONAL. Hand position on a 1600-wide field. Leave
              them out and the day is auto-placed on the trail
     concepts one entry per section, in file order:
              [ anchor-id, title, subtitle ]
   ============================================================ */

window.W2WS = window.W2WS || {};

window.W2WS.DAYS = [

  {
    id: 'd0',
    day: 0,
    region: 'FOUNDATIONS',
    title: 'The Foundations',
    lede: 'What consulting is, what a case interview actually tests, and the four stages every single case runs through. Assumes you know nothing — every term is defined the first time it appears.',
    file: 'Day_0.html',
    seed: 1207,
    concepts: [
      ['m01', 'What Consulting Actually Is', 'The job, in plain words'],
      ['m02', 'What These Clubs Do',         'NOBE, CUBE, IBC, OTCR'],
      ['m03', 'What A Case Interview Is',    'And why it exists at all'],
      ['m04', 'Structure Beats The Answer',  'The reframe everything rests on'],
      ['m05', 'The Four-Stage Skeleton',     'The shape of every single case'],
      ['m06', 'Stage 1 — Clarify',           'Scoping, not guessing'],
      ['m07', 'Stage 2 — Structure',         'Building the map out loud'],
      ['m08', 'Stage 3 — Analyse',           'Walking the map, branch by branch'],
      ['m09', 'Stage 4 — Conclude',          'Landing it like a decision'],
      ['m10', 'MECE',                        'No overlaps, no gaps'],
      ['m11', 'Issue Trees',                 'How to split anything'],
      ['m12', 'Sizing A Market',             'Guessing a number properly'],
      ['m13', 'Signposting',                 'Saying where you are'],
      ['m14', "Do's, Don'ts & Scoring",      "What they're marking you on"]
    ]
  },

  {
    id: 'd1',
    day: 1,
    region: 'ECONOMICS',
    title: 'The Economics',
    lede: 'The profit equation and everything hanging off it — costs, margins, elasticity, scale, unit economics. This is the maths you will actually use in the room.',
    file: 'Day_1.html',
    seed: 4411,
    concepts: [
      ['m01', 'The Profit Equation',      'The spine of everything'],
      ['m02', 'The Profitability Tree',   'How to actually solve the case'],
      ['m03', 'The Two Kinds of Cost',    "Costs that grow, costs that don't"],
      ['m04', 'Contribution & Breakeven', "The maths you'll use most"],
      ['m05', 'Margins & COGS',           'Where the bleeding is happening'],
      ['m06', 'Product Mix',              'Profit falls, nobody did anything wrong'],
      ['m07', 'Price Elasticity',         'What happens when you raise price'],
      ['m08', 'The Four Ways to Price',   'Floor, position, ceiling, fallback'],
      ['m09', 'Economies of Scale',       'Why big players beat small ones'],
      ['m10', 'Industry Structure',       'Why some industries are just harder'],
      ['m11', 'How to Estimate Anything', 'Guessing a number properly'],
      ['m12', 'TAM · SAM · SOM',          'From "huge market" to a real number'],
      ['m13', 'Unit Economics',           'CAC, LTV, churn, AOV, GMV'],
      ['m14', 'Using It In The Room',     'Where each concept fires']
    ]
  },

  {
    id: 'd2',
    day: 2,
    region: 'FRAMEWORKS',
    title: 'Frameworks & Case Math',
    lede: 'Six case types, one shape underneath. Learn the shape and market entry, pricing, growth, M&A and cost cutting stop being six different things to memorise.',
    file: 'Day_2.html',
    seed: 8802,
    concepts: [
      ['m00', 'Day 1 In One Page',      'Everything from yesterday, first'],
      ['m01', 'The One Shape',          'Six case types, three questions'],
      ['m02', 'Which One Do I Use?',    'Hearing the prompt correctly'],
      ['m03', 'Entering A New Market',  'Get a number, then check it runs'],
      ['m04', 'Launching A Product',    'Are we stealing from ourselves?'],
      ['m05', 'Setting A Price',        'Three walls make a box'],
      ['m06', 'Growing Faster',         'Split revenue into three parts'],
      ['m07', 'Buying A Company',       'Worth, cost, and what could go wrong'],
      ['m08', 'Cutting Costs',          'Cut where the money is'],
      ['m09', 'Doing The Maths',        'Out loud, fast, without slipping a zero'],
      ['m10', 'Finishing The Case',     'The last sixty seconds'],
      ['m11', 'Practice Cases',         'Four prompts. Run them timed']
    ]
  }

];

/* Scrolling ticker copy. Add lines freely — it loops. */
window.W2WS.TICKER = [
  'Structure beats the answer',
  'Define every term the first time you meet it',
  'No overlaps, no gaps',
  'Say where you are before you go there',
  'Real numbers beat clever variables',
  'Anchor the web before you step onto it',
  'A wrong answer with a clean structure still scores',
  'Territory explored is territory you can defend'
];
