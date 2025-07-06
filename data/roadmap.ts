export interface Topic {
  id: string;
  title: string;
  description: string;
  subtopics: string[];
  estimatedHours: number;
  resources?: string[];
  practiceProblems?: number;
  aiSuggestions?: {
    studyTips: string[];
    practiceStrategy: string;
    revisionSchedule: string;
  };
}

export interface Week {
  weekNumber: number;
  topics: Topic[];
  focus: string;
  timeAllocation: {
    theory: number; // percentage
    coding: number; // percentage
    revision: number; // percentage
  };
  aiRecommendations: string[];
}

export const cppRoadmap: Week[] = [
  // Week 1-4: Programming Fundamentals
  {
    weekNumber: 1,
    focus: "Programming Fundamentals - Basic Concepts",
    timeAllocation: { theory: 60, coding: 30, revision: 10 },
    aiRecommendations: [
      "Start with basic programming concepts and build foundation",
      "Practice writing simple programs daily",
      "Focus on understanding syntax and logic flow"
    ],
    topics: [
      {
        id: "programming-fundamentals",
        title: "Programming Fundamentals",
        description: "Basic programming concepts and principles",
        subtopics: [
          "Algorithm",
          "Flowchart",
          "Pseudocode",
          "Programming Languages",
          "Compilers and Interpreters",
          "IDE and Text Editors"
        ],
        estimatedHours: 20,
        practiceProblems: 15,
        aiSuggestions: {
          studyTips: ["Draw flowcharts for simple problems", "Write pseudocode before coding"],
          practiceStrategy: "Practice algorithm design with flowcharts and pseudocode",
          revisionSchedule: "Review concepts every 2 days"
        }
      }
    ]
  },
  {
    weekNumber: 2,
    focus: "C++ Basics - Syntax and Structure",
    timeAllocation: { theory: 50, coding: 40, revision: 10 },
    aiRecommendations: [
      "Master C++ syntax and basic operations",
      "Practice input/output operations extensively",
      "Understand data types and their usage"
    ],
    topics: [
      {
        id: "cpp-basics",
        title: "C++ Programming Basics",
        description: "Fundamental C++ programming concepts",
        subtopics: [
          "History of C++",
          "Structure of C++ Program",
          "Keywords and Identifiers",
          "Data Types",
          "Variables and Constants",
          "Operators",
          "Input/Output Statements"
        ],
        estimatedHours: 25,
        practiceProblems: 30,
        aiSuggestions: {
          studyTips: ["Practice basic I/O operations", "Understand operator precedence"],
          practiceStrategy: "Write simple programs using different data types and operators",
          revisionSchedule: "Daily practice with basic programs"
        }
      }
    ]
  },
  {
    weekNumber: 3,
    focus: "Control Structures and Decision Making",
    timeAllocation: { theory: 40, coding: 50, revision: 10 },
    aiRecommendations: [
      "Master conditional statements and loops",
      "Practice nested control structures",
      "Understand program flow control"
    ],
    topics: [
      {
        id: "control-structures",
        title: "Control Structures",
        description: "Decision making and loop structures in C++",
        subtopics: [
          "if Statement",
          "if-else Statement",
          "Nested if-else",
          "switch Statement",
          "for Loop",
          "while Loop",
          "do-while Loop",
          "Nested Loops",
          "break and continue"
        ],
        estimatedHours: 22,
        practiceProblems: 40,
        aiSuggestions: {
          studyTips: ["Practice pattern printing with loops", "Understand loop termination conditions"],
          practiceStrategy: "Solve problems involving nested loops and conditional logic",
          revisionSchedule: "Practice control structure problems daily"
        }
      }
    ]
  },
  {
    weekNumber: 4,
    focus: "Functions and Modular Programming",
    timeAllocation: { theory: 45, coding: 45, revision: 10 },
    aiRecommendations: [
      "Understand function design and implementation",
      "Practice parameter passing techniques",
      "Master function overloading concepts"
    ],
    topics: [
      {
        id: "functions",
        title: "Functions",
        description: "Function definition, declaration, and usage",
        subtopics: [
          "Function Definition",
          "Function Declaration",
          "Function Call",
          "Parameter Passing",
          "Return Statement",
          "Local and Global Variables",
          "Function Overloading",
          "Inline Functions",
          "Recursion"
        ],
        estimatedHours: 24,
        practiceProblems: 35,
        aiSuggestions: {
          studyTips: ["Practice recursive problem solving", "Understand scope and lifetime"],
          practiceStrategy: "Implement mathematical functions and recursive algorithms",
          revisionSchedule: "Review function concepts twice weekly"
        }
      }
    ]
  },

  // Week 5-8: Arrays and Strings
  {
    weekNumber: 5,
    focus: "Arrays - Single and Multi-dimensional",
    timeAllocation: { theory: 40, coding: 50, revision: 10 },
    aiRecommendations: [
      "Master array operations and indexing",
      "Practice array traversal techniques",
      "Understand memory layout of arrays"
    ],
    topics: [
      {
        id: "arrays",
        title: "Arrays",
        description: "Array declaration, initialization, and operations",
        subtopics: [
          "Array Declaration",
          "Array Initialization",
          "Array Input/Output",
          "Array Traversal",
          "Multi-dimensional Arrays",
          "Array as Function Parameter",
          "Array Operations",
          "Dynamic Arrays"
        ],
        estimatedHours: 26,
        practiceProblems: 45,
        aiSuggestions: {
          studyTips: ["Visualize array memory layout", "Practice array manipulation"],
          practiceStrategy: "Solve array searching and sorting problems",
          revisionSchedule: "Daily array problem practice"
        }
      }
    ]
  },
  {
    weekNumber: 6,
    focus: "Strings and String Operations",
    timeAllocation: { theory: 35, coding: 55, revision: 10 },
    aiRecommendations: [
      "Master string manipulation techniques",
      "Practice string library functions",
      "Understand character arrays vs strings"
    ],
    topics: [
      {
        id: "strings",
        title: "Strings",
        description: "String handling and manipulation in C++",
        subtopics: [
          "String Declaration",
          "String Input/Output",
          "String Library Functions",
          "String Concatenation",
          "String Comparison",
          "String Searching",
          "String Manipulation",
          "Character Arrays vs Strings"
        ],
        estimatedHours: 22,
        practiceProblems: 40,
        aiSuggestions: {
          studyTips: ["Practice string parsing", "Understand string memory management"],
          practiceStrategy: "Solve string manipulation and pattern matching problems",
          revisionSchedule: "Practice string problems every 2 days"
        }
      }
    ]
  },
  {
    weekNumber: 7,
    focus: "Pointers and Memory Management",
    timeAllocation: { theory: 50, coding: 40, revision: 10 },
    aiRecommendations: [
      "Understand pointer concepts thoroughly",
      "Practice pointer arithmetic",
      "Master dynamic memory allocation"
    ],
    topics: [
      {
        id: "pointers",
        title: "Pointers",
        description: "Pointer concepts and memory management",
        subtopics: [
          "Pointer Declaration",
          "Pointer Initialization",
          "Pointer Arithmetic",
          "Pointer to Pointer",
          "Array of Pointers",
          "Pointer to Array",
          "Dynamic Memory Allocation",
          "Memory Deallocation"
        ],
        estimatedHours: 28,
        practiceProblems: 35,
        aiSuggestions: {
          studyTips: ["Draw memory diagrams", "Practice pointer manipulation"],
          practiceStrategy: "Implement dynamic data structures using pointers",
          revisionSchedule: "Review pointer concepts weekly"
        }
      }
    ]
  },
  {
    weekNumber: 8,
    focus: "Structures and User-Defined Data Types",
    timeAllocation: { theory: 45, coding: 45, revision: 10 },
    aiRecommendations: [
      "Understand structure definition and usage",
      "Practice nested structures",
      "Master array of structures"
    ],
    topics: [
      {
        id: "structures",
        title: "Structures",
        description: "User-defined data types and structures",
        subtopics: [
          "Structure Definition",
          "Structure Declaration",
          "Structure Initialization",
          "Accessing Structure Members",
          "Array of Structures",
          "Nested Structures",
          "Structure as Function Parameter",
          "Pointer to Structure"
        ],
        estimatedHours: 24,
        practiceProblems: 30,
        aiSuggestions: {
          studyTips: ["Practice real-world structure examples", "Understand memory layout"],
          practiceStrategy: "Create programs using complex data structures",
          revisionSchedule: "Practice structure problems twice weekly"
        }
      }
    ]
  },

  // Week 9-12: Object-Oriented Programming
  {
    weekNumber: 9,
    focus: "Classes and Objects - OOP Fundamentals",
    timeAllocation: { theory: 55, coding: 35, revision: 10 },
    aiRecommendations: [
      "Understand class and object concepts",
      "Practice class design principles",
      "Master constructor and destructor usage"
    ],
    topics: [
      {
        id: "classes-objects",
        title: "Classes and Objects",
        description: "Object-oriented programming fundamentals",
        subtopics: [
          "Class Definition",
          "Object Declaration",
          "Data Members",
          "Member Functions",
          "Access Specifiers",
          "Constructor",
          "Destructor",
          "this Pointer"
        ],
        estimatedHours: 26,
        practiceProblems: 35,
        aiSuggestions: {
          studyTips: ["Design classes for real-world entities", "Practice constructor types"],
          practiceStrategy: "Create classes with proper encapsulation",
          revisionSchedule: "Review OOP concepts every 3 days"
        }
      }
    ]
  },
  {
    weekNumber: 10,
    focus: "Inheritance and Code Reusability",
    timeAllocation: { theory: 50, coding: 40, revision: 10 },
    aiRecommendations: [
      "Master inheritance types and concepts",
      "Practice inheritance hierarchies",
      "Understand access control in inheritance"
    ],
    topics: [
      {
        id: "inheritance",
        title: "Inheritance",
        description: "Inheritance concepts and implementation",
        subtopics: [
          "Types of Inheritance",
          "Single Inheritance",
          "Multiple Inheritance",
          "Multilevel Inheritance",
          "Hierarchical Inheritance",
          "Hybrid Inheritance",
          "Access Control in Inheritance",
          "Constructor in Inheritance"
        ],
        estimatedHours: 28,
        practiceProblems: 40,
        aiSuggestions: {
          studyTips: ["Draw inheritance diagrams", "Practice inheritance scenarios"],
          practiceStrategy: "Implement inheritance hierarchies for different domains",
          revisionSchedule: "Practice inheritance problems twice weekly"
        }
      }
    ]
  },
  {
    weekNumber: 11,
    focus: "Polymorphism and Virtual Functions",
    timeAllocation: { theory: 45, coding: 45, revision: 10 },
    aiRecommendations: [
      "Understand polymorphism concepts",
      "Practice function and operator overloading",
      "Master virtual function implementation"
    ],
    topics: [
      {
        id: "polymorphism",
        title: "Polymorphism",
        description: "Polymorphism and virtual functions",
        subtopics: [
          "Function Overloading",
          "Operator Overloading",
          "Virtual Functions",
          "Pure Virtual Functions",
          "Abstract Classes",
          "Runtime Polymorphism",
          "Virtual Destructors",
          "RTTI (Run-Time Type Information)"
        ],
        estimatedHours: 30,
        practiceProblems: 45,
        aiSuggestions: {
          studyTips: ["Practice operator overloading", "Understand virtual function tables"],
          practiceStrategy: "Implement polymorphic behavior in class hierarchies",
          revisionSchedule: "Review polymorphism concepts weekly"
        }
      }
    ]
  },
  {
    weekNumber: 12,
    focus: "Advanced OOP Concepts",
    timeAllocation: { theory: 40, coding: 50, revision: 10 },
    aiRecommendations: [
      "Master advanced OOP features",
      "Practice template programming",
      "Understand exception handling"
    ],
    topics: [
      {
        id: "advanced-oop",
        title: "Advanced OOP Concepts",
        description: "Advanced object-oriented programming features",
        subtopics: [
          "Friend Functions",
          "Friend Classes",
          "Static Members",
          "Nested Classes",
          "Templates",
          "Exception Handling",
          "Namespaces",
          "File Handling"
        ],
        estimatedHours: 32,
        practiceProblems: 40,
        aiSuggestions: {
          studyTips: ["Practice template programming", "Understand exception handling"],
          practiceStrategy: "Create generic programs using templates",
          revisionSchedule: "Practice advanced OOP concepts twice weekly"
        }
      }
    ]
  },

  // Week 13-16: Data Structures
  {
    weekNumber: 13,
    focus: "Linear Data Structures - Arrays and Linked Lists",
    timeAllocation: { theory: 40, coding: 50, revision: 10 },
    aiRecommendations: [
      "Implement data structures from scratch",
      "Understand time and space complexity",
      "Practice traversal algorithms"
    ],
    topics: [
      {
        id: "linear-data-structures",
        title: "Linear Data Structures",
        description: "Arrays, linked lists, and linear data organization",
        subtopics: [
          "Array Implementation",
          "Linked List Types",
          "Singly Linked List",
          "Doubly Linked List",
          "Circular Linked List",
          "List Operations",
          "Array vs Linked List",
          "Applications"
        ],
        estimatedHours: 28,
        practiceProblems: 50,
        aiSuggestions: {
          studyTips: ["Implement all operations manually", "Understand memory allocation"],
          practiceStrategy: "Solve problems using different linear structures",
          revisionSchedule: "Practice implementation weekly"
        }
      }
    ]
  },
  {
    weekNumber: 14,
    focus: "Stacks and Queues",
    timeAllocation: { theory: 35, coding: 55, revision: 10 },
    aiRecommendations: [
      "Master stack and queue operations",
      "Practice application problems",
      "Understand LIFO and FIFO principles"
    ],
    topics: [
      {
        id: "stacks-queues",
        title: "Stacks and Queues",
        description: "Stack and queue data structures and applications",
        subtopics: [
          "Stack Implementation",
          "Stack Operations",
          "Stack Applications",
          "Queue Implementation",
          "Queue Operations",
          "Circular Queue",
          "Priority Queue",
          "Deque"
        ],
        estimatedHours: 26,
        practiceProblems: 45,
        aiSuggestions: {
          studyTips: ["Practice expression evaluation", "Understand queue variants"],
          practiceStrategy: "Solve problems using stack and queue applications",
          revisionSchedule: "Practice stack/queue problems every 2 days"
        }
      }
    ]
  },
  {
    weekNumber: 15,
    focus: "Trees and Binary Trees",
    timeAllocation: { theory: 40, coding: 50, revision: 10 },
    aiRecommendations: [
      "Understand tree terminology and concepts",
      "Practice tree traversal algorithms",
      "Master binary tree operations"
    ],
    topics: [
      {
        id: "trees",
        title: "Trees",
        description: "Tree data structures and operations",
        subtopics: [
          "Tree Terminology",
          "Binary Tree",
          "Tree Traversal",
          "Binary Search Tree",
          "AVL Tree",
          "Heap",
          "Tree Applications",
          "Expression Trees"
        ],
        estimatedHours: 32,
        practiceProblems: 55,
        aiSuggestions: {
          studyTips: ["Visualize tree structures", "Practice recursive algorithms"],
          practiceStrategy: "Implement tree traversal and manipulation algorithms",
          revisionSchedule: "Practice tree problems twice weekly"
        }
      }
    ]
  },
  {
    weekNumber: 16,
    focus: "Graphs and Graph Algorithms",
    timeAllocation: { theory: 45, coding: 45, revision: 10 },
    aiRecommendations: [
      "Understand graph representation methods",
      "Practice graph traversal algorithms",
      "Master shortest path algorithms"
    ],
    topics: [
      {
        id: "graphs",
        title: "Graphs",
        description: "Graph data structures and algorithms",
        subtopics: [
          "Graph Terminology",
          "Graph Representation",
          "Graph Traversal (DFS, BFS)",
          "Shortest Path Algorithms",
          "Minimum Spanning Tree",
          "Topological Sorting",
          "Graph Applications",
          "Network Algorithms"
        ],
        estimatedHours: 30,
        practiceProblems: 50,
        aiSuggestions: {
          studyTips: ["Practice graph representation", "Understand algorithm complexity"],
          practiceStrategy: "Implement graph algorithms and solve network problems",
          revisionSchedule: "Review graph concepts weekly"
        }
      }
    ]
  },

  // Week 17-20: Algorithms
  {
    weekNumber: 17,
    focus: "Searching and Sorting Algorithms",
    timeAllocation: { theory: 30, coding: 60, revision: 10 },
    aiRecommendations: [
      "Master all sorting algorithms",
      "Understand time complexity analysis",
      "Practice algorithm implementation"
    ],
    topics: [
      {
        id: "searching-sorting",
        title: "Searching and Sorting",
        description: "Fundamental searching and sorting algorithms",
        subtopics: [
          "Linear Search",
          "Binary Search",
          "Bubble Sort",
          "Selection Sort",
          "Insertion Sort",
          "Merge Sort",
          "Quick Sort",
          "Heap Sort",
          "Radix Sort"
        ],
        estimatedHours: 28,
        practiceProblems: 60,
        aiSuggestions: {
          studyTips: ["Analyze time complexity", "Compare algorithm performance"],
          practiceStrategy: "Implement and compare different sorting algorithms",
          revisionSchedule: "Practice sorting problems daily"
        }
      }
    ]
  },
  {
    weekNumber: 18,
    focus: "Dynamic Programming",
    timeAllocation: { theory: 35, coding: 55, revision: 10 },
    aiRecommendations: [
      "Understand DP principles and patterns",
      "Practice problem decomposition",
      "Master memoization techniques"
    ],
    topics: [
      {
        id: "dynamic-programming",
        title: "Dynamic Programming",
        description: "Dynamic programming concepts and applications",
        subtopics: [
          "DP Principles",
          "Memoization",
          "Tabulation",
          "Fibonacci Series",
          "Knapsack Problem",
          "Longest Common Subsequence",
          "Edit Distance",
          "Coin Change Problem"
        ],
        estimatedHours: 30,
        practiceProblems: 50,
        aiSuggestions: {
          studyTips: ["Identify DP patterns", "Practice state definition"],
          practiceStrategy: "Solve classic DP problems with different approaches",
          revisionSchedule: "Practice DP problems every 2 days"
        }
      }
    ]
  },
  {
    weekNumber: 19,
    focus: "Greedy Algorithms",
    timeAllocation: { theory: 40, coding: 50, revision: 10 },
    aiRecommendations: [
      "Understand greedy choice property",
      "Practice optimization problems",
      "Master greedy algorithm design"
    ],
    topics: [
      {
        id: "greedy-algorithms",
        title: "Greedy Algorithms",
        description: "Greedy algorithm design and implementation",
        subtopics: [
          "Greedy Method",
          "Activity Selection",
          "Fractional Knapsack",
          "Job Scheduling",
          "Huffman Coding",
          "Minimum Spanning Tree",
          "Dijkstra's Algorithm",
          "Greedy vs DP"
        ],
        estimatedHours: 26,
        practiceProblems: 45,
        aiSuggestions: {
          studyTips: ["Understand greedy choice", "Practice optimization problems"],
          practiceStrategy: "Solve greedy problems and compare with other approaches",
          revisionSchedule: "Review greedy concepts twice weekly"
        }
      }
    ]
  },
  {
    weekNumber: 20,
    focus: "Backtracking and Divide & Conquer",
    timeAllocation: { theory: 35, coding: 55, revision: 10 },
    aiRecommendations: [
      "Master backtracking technique",
      "Practice constraint satisfaction problems",
      "Understand divide and conquer strategy"
    ],
    topics: [
      {
        id: "backtracking-divide-conquer",
        title: "Backtracking and Divide & Conquer",
        description: "Advanced algorithmic techniques",
        subtopics: [
          "Backtracking Method",
          "N-Queens Problem",
          "Sudoku Solver",
          "Graph Coloring",
          "Divide and Conquer",
          "Binary Search (D&C)",
          "Merge Sort (D&C)",
          "Quick Sort (D&C)"
        ],
        estimatedHours: 28,
        practiceProblems: 40,
        aiSuggestions: {
          studyTips: ["Practice constraint problems", "Understand recursion patterns"],
          practiceStrategy: "Solve backtracking and divide-conquer problems",
          revisionSchedule: "Practice algorithmic techniques weekly"
        }
      }
    ]
  },

  // Week 21-24: Database and System Design
  {
    weekNumber: 21,
    focus: "Database Management System (DBMS)",
    timeAllocation: { theory: 70, coding: 20, revision: 10 },
    aiRecommendations: [
      "Understand database concepts thoroughly",
      "Practice SQL query writing",
      "Master normalization techniques"
    ],
    topics: [
      {
        id: "dbms",
        title: "Database Management System",
        description: "Database concepts and management",
        subtopics: [
          "Database Concepts",
          "DBMS Architecture",
          "Data Models",
          "ER Model",
          "Relational Model",
          "SQL Basics",
          "Normalization",
          "Transactions",
          "Concurrency Control"
        ],
        estimatedHours: 25,
        practiceProblems: 30,
        aiSuggestions: {
          studyTips: ["Practice ER diagram creation", "Understand normalization rules"],
          practiceStrategy: "Create database schemas and write SQL queries",
          revisionSchedule: "Review DBMS concepts twice weekly"
        }
      }
    ]
  },
  {
    weekNumber: 22,
    focus: "Operating System Concepts",
    timeAllocation: { theory: 75, coding: 15, revision: 10 },
    aiRecommendations: [
      "Understand OS fundamentals",
      "Practice process management concepts",
      "Master memory management techniques"
    ],
    topics: [
      {
        id: "operating-system",
        title: "Operating System",
        description: "Operating system concepts and management",
        subtopics: [
          "OS Introduction",
          "Process Management",
          "CPU Scheduling",
          "Memory Management",
          "Virtual Memory",
          "File Systems",
          "I/O Management",
          "Deadlocks",
          "Synchronization"
        ],
        estimatedHours: 24,
        practiceProblems: 25,
        aiSuggestions: {
          studyTips: ["Understand process states", "Practice scheduling algorithms"],
          practiceStrategy: "Solve OS problems and analyze system behavior",
          revisionSchedule: "Review OS concepts weekly"
        }
      }
    ]
  },
  {
    weekNumber: 23,
    focus: "Computer Networks",
    timeAllocation: { theory: 80, coding: 10, revision: 10 },
    aiRecommendations: [
      "Understand network protocols",
      "Practice network problem solving",
      "Master OSI model layers"
    ],
    topics: [
      {
        id: "computer-networks",
        title: "Computer Networks",
        description: "Network concepts and protocols",
        subtopics: [
          "Network Basics",
          "OSI Model",
          "TCP/IP Model",
          "Data Link Layer",
          "Network Layer",
          "Transport Layer",
          "Application Layer",
          "Network Security",
          "Wireless Networks"
        ],
        estimatedHours: 22,
        practiceProblems: 20,
        aiSuggestions: {
          studyTips: ["Understand protocol layers", "Practice network calculations"],
          practiceStrategy: "Analyze network protocols and solve networking problems",
          revisionSchedule: "Review network concepts twice weekly"
        }
      }
    ]
  },
  {
    weekNumber: 24,
    focus: "Software Engineering",
    timeAllocation: { theory: 70, coding: 20, revision: 10 },
    aiRecommendations: [
      "Understand SDLC models",
      "Practice software design principles",
      "Master testing methodologies"
    ],
    topics: [
      {
        id: "software-engineering",
        title: "Software Engineering",
        description: "Software development lifecycle and methodologies",
        subtopics: [
          "SDLC Models",
          "Waterfall Model",
          "Agile Methodology",
          "Requirements Engineering",
          "System Design",
          "Testing Methods",
          "Project Management",
          "Software Metrics",
          "Quality Assurance"
        ],
        estimatedHours: 20,
        practiceProblems: 15,
        aiSuggestions: {
          studyTips: ["Understand SDLC phases", "Practice design principles"],
          practiceStrategy: "Analyze software projects and apply SE principles",
          revisionSchedule: "Review SE concepts weekly"
        }
      }
    ]
  },

  // Week 25-27: Aptitude and Reasoning
  {
    weekNumber: 25,
    focus: "Quantitative Aptitude - Arithmetic",
    timeAllocation: { theory: 30, coding: 5, revision: 65 },
    aiRecommendations: [
      "Practice speed calculation techniques",
      "Master shortcut methods",
      "Focus on accuracy and timing"
    ],
    topics: [
      {
        id: "quantitative-aptitude",
        title: "Quantitative Aptitude",
        description: "Mathematical and numerical ability",
        subtopics: [
          "Number System",
          "Percentage",
          "Profit and Loss",
          "Simple Interest",
          "Compound Interest",
          "Time and Work",
          "Time and Distance",
          "Ratio and Proportion",
          "Mixtures and Alligations"
        ],
        estimatedHours: 20,
        practiceProblems: 100,
        aiSuggestions: {
          studyTips: ["Practice mental calculations", "Learn shortcut formulas"],
          practiceStrategy: "Solve timed practice tests with mixed problems",
          revisionSchedule: "Daily practice with increasing difficulty"
        }
      }
    ]
  },
  {
    weekNumber: 26,
    focus: "Logical Reasoning",
    timeAllocation: { theory: 35, coding: 5, revision: 60 },
    aiRecommendations: [
      "Practice pattern recognition",
      "Master logical deduction",
      "Improve analytical thinking"
    ],
    topics: [
      {
        id: "logical-reasoning",
        title: "Logical Reasoning",
        description: "Logical and analytical reasoning skills",
        subtopics: [
          "Series Completion",
          "Analogies",
          "Classification",
          "Coding-Decoding",
          "Blood Relations",
          "Direction Sense",
          "Ranking and Arrangement",
          "Logical Venn Diagrams",
          "Syllogisms"
        ],
        estimatedHours: 18,
        practiceProblems: 80,
        aiSuggestions: {
          studyTips: ["Practice pattern identification", "Understand logical relationships"],
          practiceStrategy: "Solve reasoning problems with time constraints",
          revisionSchedule: "Daily practice with mixed reasoning types"
        }
      }
    ]
  },
  {
    weekNumber: 27,
    focus: "Verbal Ability and Communication",
    timeAllocation: { theory: 40, coding: 5, revision: 55 },
    aiRecommendations: [
      "Improve vocabulary and grammar",
      "Practice reading comprehension",
      "Master sentence correction techniques"
    ],
    topics: [
      {
        id: "verbal-ability",
        title: "Verbal Ability",
        description: "English language and communication skills",
        subtopics: [
          "Reading Comprehension",
          "Vocabulary",
          "Grammar",
          "Sentence Correction",
          "Para Jumbles",
          "Synonyms and Antonyms",
          "Idioms and Phrases",
          "One Word Substitution",
          "Error Detection"
        ],
        estimatedHours: 16,
        practiceProblems: 70,
        aiSuggestions: {
          studyTips: ["Read regularly to improve comprehension", "Practice grammar rules"],
          practiceStrategy: "Solve verbal ability questions with time limits",
          revisionSchedule: "Daily vocabulary and grammar practice"
        }
      }
    ]
  },

  // Week 28-30: Advanced Topics and Preparation
  {
    weekNumber: 28,
    focus: "Competitive Programming Basics",
    timeAllocation: { theory: 25, coding: 65, revision: 10 },
    aiRecommendations: [
      "Practice competitive programming problems",
      "Master algorithmic problem solving",
      "Improve coding speed and accuracy"
    ],
    topics: [
      {
        id: "competitive-programming",
        title: "Competitive Programming",
        description: "Advanced problem solving and competitive coding",
        subtopics: [
          "Problem Solving Strategies",
          "Time Complexity Analysis",
          "Space Complexity Analysis",
          "Advanced Data Structures",
          "Mathematical Algorithms",
          "String Algorithms",
          "Graph Algorithms",
          "Dynamic Programming Advanced",
          "Competitive Programming Platforms"
        ],
        estimatedHours: 25,
        practiceProblems: 60,
        aiSuggestions: {
          studyTips: ["Practice on competitive platforms", "Analyze problem patterns"],
          practiceStrategy: "Solve problems from various competitive programming sites",
          revisionSchedule: "Daily competitive programming practice"
        }
      }
    ]
  },
  {
    weekNumber: 29,
    focus: "Mock Tests and Interview Preparation",
    timeAllocation: { theory: 15, coding: 60, revision: 25 },
    aiRecommendations: [
      "Take comprehensive mock tests",
      "Practice interview questions",
      "Improve problem-solving communication"
    ],
    topics: [
      {
        id: "mock-tests",
        title: "Mock Tests and Interview Preparation",
        description: "Comprehensive test preparation and interview skills",
        subtopics: [
          "Technical Mock Tests",
          "Aptitude Mock Tests",
          "Coding Interview Questions",
          "System Design Basics",
          "HR Interview Preparation",
          "Resume Building",
          "Communication Skills",
          "Problem Solving Approach",
          "Time Management"
        ],
        estimatedHours: 30,
        practiceProblems: 100,
        aiSuggestions: {
          studyTips: ["Practice explaining solutions", "Simulate interview conditions"],
          practiceStrategy: "Take full-length mock tests and analyze performance",
          revisionSchedule: "Daily mock test practice with analysis"
        }
      }
    ]
  },
  {
    weekNumber: 30,
    focus: "Final Revision and Placement Preparation",
    timeAllocation: { theory: 20, coding: 40, revision: 40 },
    aiRecommendations: [
      "Comprehensive revision of all topics",
      "Focus on weak areas identified",
      "Practice final mock interviews"
    ],
    topics: [
      {
        id: "final-revision",
        title: "Final Revision and Placement Preparation",
        description: "Complete revision and final preparation",
        subtopics: [
          "Complete Topic Revision",
          "Quick Reference Notes",
          "Important Formulas",
          "Common Interview Questions",
          "Last-minute Tips",
          "Stress Management",
          "Final Mock Interviews",
          "Placement Strategy",
          "Company-specific Preparation"
        ],
        estimatedHours: 35,
        practiceProblems: 80,
        aiSuggestions: {
          studyTips: ["Create quick reference materials", "Focus on frequently asked topics"],
          practiceStrategy: "Intensive revision with mock interviews",
          revisionSchedule: "Comprehensive daily revision schedule"
        }
      }
    ]
  }
];

// Helper functions
export const getTotalHours = () => {
  return cppRoadmap.reduce((total, week) => {
    return total + week.topics.reduce((weekTotal, topic) => weekTotal + topic.estimatedHours, 0);
  }, 0);
};

export const getTotalProblems = () => {
  return cppRoadmap.reduce((total, week) => {
    return total + week.topics.reduce((weekTotal, topic) => weekTotal + (topic.practiceProblems || 0), 0);
  }, 0);
};

export const getTopicsByCategory = () => {
  const categories = {
    'Programming Fundamentals': ['programming-fundamentals', 'cpp-basics', 'control-structures', 'functions'],
    'Arrays and Strings': ['arrays', 'strings', 'pointers', 'structures'],
    'Object-Oriented Programming': ['classes-objects', 'inheritance', 'polymorphism', 'advanced-oop'],
    'Data Structures': ['linear-data-structures', 'stacks-queues', 'trees', 'graphs'],
    'Algorithms': ['searching-sorting', 'dynamic-programming', 'greedy-algorithms', 'backtracking-divide-conquer'],
    'System Concepts': ['dbms', 'operating-system', 'computer-networks', 'software-engineering'],
    'Aptitude and Reasoning': ['quantitative-aptitude', 'logical-reasoning', 'verbal-ability'],
    'Advanced Topics': ['competitive-programming', 'mock-tests', 'final-revision']
  };
  
  return categories;
};

export const getWeeklyTimeAllocation = () => {
  return cppRoadmap.map(week => ({
    week: week.weekNumber,
    focus: week.focus,
    timeAllocation: week.timeAllocation,
    estimatedHours: week.topics.reduce((total, topic) => total + topic.estimatedHours, 0)
  }));
};

export const getAIRecommendations = (weekNumber: number) => {
  const week = cppRoadmap.find(w => w.weekNumber === weekNumber);
  return week ? week.aiRecommendations : [];
};

export const getDailyStudyPlan = (weekNumber: number, dayOfWeek: number, availableHours: number) => {
  const week = cppRoadmap.find(w => w.weekNumber === weekNumber);
  if (!week) {
    // Enhanced fallback for missing weeks
    console.log(`Week ${weekNumber} not found, using intelligent fallback`);
    
    // Find nearest available week
    let fallbackWeek = null;
    for (let offset = 1; offset <= 5; offset++) {
      const prevWeek = cppRoadmap.find(w => w.weekNumber === weekNumber - offset);
      const nextWeek = cppRoadmap.find(w => w.weekNumber === weekNumber + offset);
      
      if (prevWeek) {
        fallbackWeek = prevWeek;
        break;
      }
      if (nextWeek) {
        fallbackWeek = nextWeek;
        break;
      }
    }
    
    // Final fallback to first week
    if (!fallbackWeek) {
      fallbackWeek = cppRoadmap[0];
    }
    
    if (!fallbackWeek) return null;
    
    return generateDailyPlanFromWeek(fallbackWeek, dayOfWeek, availableHours, weekNumber);
  }

  return generateDailyPlanFromWeek(week, dayOfWeek, availableHours, weekNumber);
};

// Enhanced daily plan generation with AI optimization
function generateDailyPlanFromWeek(week: Week, dayOfWeek: number, availableHours: number, targetWeek: number) {
  const topic = week.topics[0];
  if (!topic || !topic.subtopics || topic.subtopics.length === 0) {
    return null;
  }

  // Smart subtopic distribution based on day of week and available time
  const totalSubtopics = topic.subtopics.length;
  const daysPerWeek = 7;
  
  // Intelligent subtopic allocation
  let subtopicsPerDay = Math.ceil(totalSubtopics / daysPerWeek);
  
  // Adjust based on available hours
  if (availableHours >= 6) {
    subtopicsPerDay = Math.min(subtopicsPerDay + 1, totalSubtopics);
  } else if (availableHours <= 2) {
    subtopicsPerDay = Math.max(1, subtopicsPerDay - 1);
  }
  
  const startIndex = (dayOfWeek - 1) * subtopicsPerDay;
  const endIndex = Math.min(startIndex + subtopicsPerDay, totalSubtopics);
  
  // Ensure we don't go out of bounds
  const actualStartIndex = Math.min(startIndex, totalSubtopics - 1);
  const actualEndIndex = Math.min(endIndex, totalSubtopics);
  
  const dailySubtopics = topic.subtopics.slice(actualStartIndex, actualEndIndex);
  
  // If no subtopics for this day, provide a review topic
  if (dailySubtopics.length === 0) {
    const reviewSubtopic = topic.subtopics[0] || 'Review previous concepts';
    dailySubtopics.push(`Review: ${reviewSubtopic}`);
  }
  
  // Intelligent time allocation per subtopic
  const timePerSubtopic = Math.max(30, Math.floor((availableHours * 60) / dailySubtopics.length));
  
  // Enhanced AI recommendations based on week and topic type
  const enhancedRecommendations = [
    ...week.aiRecommendations,
    ...generateWeekSpecificTips(targetWeek, topic, availableHours),
    ...generateDaySpecificTips(dayOfWeek, availableHours)
  ];

  return {
    date: new Date().toISOString().split('T')[0],
    weekNumber: targetWeek,
    topic: topic.title,
    subtopics: dailySubtopics.map((subtopic, index) => ({
      title: subtopic,
      estimatedTime: timePerSubtopic,
      priority: determinePriority(index, dailySubtopics.length, targetWeek),
      startTime: calculateStartTime(index, timePerSubtopic, availableHours),
      endTime: calculateEndTime(index, timePerSubtopic, availableHours),
      studyType: determineStudyType(subtopic, topic.id),
      practiceProblems: generatePracticeProblems(subtopic, topic.id)
    })),
    tips: enhancedRecommendations,
    totalHours: availableHours,
    focusArea: determineFocusArea(targetWeek),
    completionTarget: calculateCompletionTarget(targetWeek, topic),
    urgencyLevel: determineUrgencyLevel(targetWeek)
  };
}

// Generate week-specific tips based on curriculum phase
function generateWeekSpecificTips(weekNumber: number, topic: Topic, availableHours: number): string[] {
  const tips: string[] = [];
  
  // Phase-based recommendations
  if (weekNumber <= 4) {
    tips.push("🎯 Foundation Phase: Focus on understanding core concepts thoroughly");
    tips.push("📚 Take time to understand each concept before moving forward");
  } else if (weekNumber <= 8) {
    tips.push("⚡ Implementation Phase: Practice coding examples for each concept");
    tips.push("🔧 Build projects to apply what you've learned");
  } else if (weekNumber <= 12) {
    tips.push("🏗️ OOP Mastery Phase: Design classes and practice inheritance");
    tips.push("💡 Think in terms of objects and relationships");
  } else if (weekNumber <= 16) {
    tips.push("🗂️ Data Structures Phase: Implement each structure from scratch");
    tips.push("📊 Understand time and space complexity for each operation");
  } else if (weekNumber <= 20) {
    tips.push("🧮 Algorithms Phase: Focus on problem-solving patterns");
    tips.push("🎯 Practice algorithmic thinking and optimization");
  } else if (weekNumber <= 24) {
    tips.push("💻 Systems Phase: Understand real-world applications");
    tips.push("🔗 Connect theoretical concepts to practical systems");
  } else if (weekNumber <= 27) {
    tips.push("🧠 Aptitude Phase: Practice speed and accuracy");
    tips.push("⏱️ Time management is crucial for aptitude tests");
  } else {
    tips.push("🎯 Final Phase: Intensive practice and mock interviews");
    tips.push("🚀 Focus on confidence building and interview skills");
  }
  
  // Time-based recommendations
  if (availableHours >= 6) {
    tips.push("⏰ Extended study time: Include practical projects and extra practice");
  } else if (availableHours <= 2) {
    tips.push("⚡ Limited time: Focus on key concepts and quick revision");
  }
  
  return tips;
}

// Generate day-specific tips
function generateDaySpecificTips(dayOfWeek: number, availableHours: number): string[] {
  const tips: string[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayOfWeek] || 'Today';
  
  switch (dayOfWeek) {
    case 0: // Sunday
      tips.push("🌅 Sunday: Perfect for comprehensive review and planning next week");
      break;
    case 1: // Monday
      tips.push("🚀 Monday: Start strong with new concepts and fresh energy");
      break;
    case 2: // Tuesday
    case 4: // Thursday
      tips.push("🔬 Lab Day: Focus on quick concepts and light revision");
      break;
    case 3: // Wednesday
      tips.push("⚡ Mid-week: Maintain momentum with consistent practice");
      break;
    case 5: // Friday
      tips.push("🎯 Friday: Wrap up the week's topics and prepare for weekend");
      break;
    case 6: // Saturday
      tips.push("📚 Saturday: Intensive study day with extended practice");
      break;
  }
  
  return tips;
}

// Determine priority based on position and week
function determinePriority(index: number, totalSubtopics: number, weekNumber: number): 'high' | 'medium' | 'low' {
  // First subtopic is always high priority
  if (index === 0) return 'high';
  
  // For early weeks, more subtopics are high priority
  if (weekNumber <= 10) {
    return index <= 1 ? 'high' : index <= 2 ? 'medium' : 'low';
  }
  
  // For later weeks, prioritize based on position
  const ratio = index / totalSubtopics;
  if (ratio <= 0.3) return 'high';
  if (ratio <= 0.7) return 'medium';
  return 'low';
}

// Calculate optimal start time based on available hours
function calculateStartTime(index: number, timePerSubtopic: number, availableHours: number): string {
  const baseStartHour = availableHours >= 6 ? 9 : 10;
  const totalMinutes = index * (timePerSubtopic + 10); // Include 10-min break
  const startHour = baseStartHour + Math.floor(totalMinutes / 60);
  const startMinute = totalMinutes % 60;
  
  return `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
}

// Calculate end time
function calculateEndTime(index: number, timePerSubtopic: number, availableHours: number): string {
  const baseStartHour = availableHours >= 6 ? 9 : 10;
  const totalMinutes = index * (timePerSubtopic + 10) + timePerSubtopic;
  const endHour = baseStartHour + Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;
  
  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
}

// Determine study type based on subtopic content
function determineStudyType(subtopic: string, topicId: string): 'theory' | 'coding' | 'practice' | 'revision' {
  const subtopicLower = subtopic.toLowerCase();
  
  if (subtopicLower.includes('review') || subtopicLower.includes('revision')) {
    return 'revision';
  }
  
  if (subtopicLower.includes('implementation') || subtopicLower.includes('coding') || 
      subtopicLower.includes('program') || topicId.includes('programming')) {
    return 'coding';
  }
  
  if (subtopicLower.includes('practice') || subtopicLower.includes('problem') || 
      subtopicLower.includes('exercise')) {
    return 'practice';
  }
  
  return 'theory';
}

// Generate practice problems for subtopic
function generatePracticeProblems(subtopic: string, topicId: string): number {
  const subtopicLower = subtopic.toLowerCase();
  
  // More problems for coding and algorithm topics
  if (topicId.includes('algorithm') || topicId.includes('programming')) {
    return Math.floor(Math.random() * 5) + 3; // 3-7 problems
  }
  
  // Moderate problems for data structures
  if (topicId.includes('data-structures') || topicId.includes('trees') || topicId.includes('graphs')) {
    return Math.floor(Math.random() * 3) + 2; // 2-4 problems
  }
  
  // Fewer problems for theory topics
  if (topicId.includes('dbms') || topicId.includes('os') || topicId.includes('networks')) {
    return Math.floor(Math.random() * 2) + 1; // 1-2 problems
  }
  
  // Default
  return Math.floor(Math.random() * 3) + 2; // 2-4 problems
}

// Determine focus area based on week number
function determineFocusArea(weekNumber: number): string {
  if (weekNumber <= 4) return 'Programming Fundamentals';
  if (weekNumber <= 8) return 'Arrays and Strings';
  if (weekNumber <= 12) return 'Object-Oriented Programming';
  if (weekNumber <= 16) return 'Data Structures';
  if (weekNumber <= 20) return 'Algorithms';
  if (weekNumber <= 24) return 'System Concepts';
  if (weekNumber <= 27) return 'Aptitude & Reasoning';
  return 'Final Preparation';
}

// Calculate completion target for the week
function calculateCompletionTarget(weekNumber: number, topic: Topic): {
  subtopicsToComplete: number;
  hoursToSpend: number;
  practiceProblems: number;
} {
  const totalSubtopics = topic.subtopics.length;
  const totalHours = topic.estimatedHours;
  const totalProblems = topic.practiceProblems;
  
  return {
    subtopicsToComplete: Math.ceil(totalSubtopics / 7), // Spread across week
    hoursToSpend: Math.ceil(totalHours / 7),
    practiceProblems: Math.ceil(totalProblems / 7)
  };
}

// Determine urgency level based on week number and current date
function determineUrgencyLevel(weekNumber: number): 'low' | 'medium' | 'high' | 'critical' {
  const currentDate = new Date();
  const startDate = new Date('2025-07-06'); // Default start date
  const currentWeek = Math.ceil((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  if (weekNumber < currentWeek - 2) return 'critical'; // Very behind
  if (weekNumber < currentWeek) return 'high'; // Behind schedule
  if (weekNumber === currentWeek) return 'medium'; // Current week
  return 'low'; // Future weeks
}

// Enhanced completion tracking functions
export const getTopicCompletionStatus = (topicId: string, completedTopics: string[], topicsProgress: any) => {
  const isCompleted = completedTopics.includes(topicId);
  const progress = topicsProgress?.[topicId];
  
  if (isCompleted) {
    return { status: 'completed', percentage: 100 };
  }
  
  if (progress?.subtopicsProgress) {
    const completed = progress.subtopicsProgress.filter((sp: any) => sp.completed).length;
    const total = progress.subtopicsProgress.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    if (percentage > 0) {
      return { status: 'in_progress', percentage };
    }
  }
  
  return { status: 'not_started', percentage: 0 };
};

export const getWeekCompletionStatus = (weekNumber: number, completedTopics: string[], topicsProgress: any) => {
  const weekTopics = cppRoadmap.find(w => w.weekNumber === weekNumber)?.topics || [];
  
  if (weekTopics.length === 0) {
    return { status: 'not_applicable', percentage: 0, completedCount: 0, totalCount: 0 };
  }
  
  let completedCount = 0;
  let totalPercentage = 0;
  
  weekTopics.forEach(topic => {
    const status = getTopicCompletionStatus(topic.id, completedTopics, topicsProgress);
    totalPercentage += status.percentage;
    if (status.percentage === 100) completedCount++;
  });
  
  const averagePercentage = totalPercentage / weekTopics.length;
  let status = 'not_started';
  
  if (averagePercentage === 100) status = 'completed';
  else if (averagePercentage > 0) status = 'in_progress';
  
  return {
    status,
    percentage: averagePercentage,
    completedCount,
    totalCount: weekTopics.length
  };
};

export const getOverallCompletionStatus = (completedTopics: string[], topicsProgress: any) => {
  const allTopics = cppRoadmap.flatMap(w => w.topics);
  let totalPercentage = 0;
  let completedCount = 0;
  
  allTopics.forEach(topic => {
    const status = getTopicCompletionStatus(topic.id, completedTopics, topicsProgress);
    totalPercentage += status.percentage;
    if (status.percentage === 100) completedCount++;
  });
  
  const averagePercentage = totalPercentage / allTopics.length;
  
  return {
    percentage: averagePercentage,
    completedCount,
    totalCount: allTopics.length,
    onTrackForCompletion: averagePercentage >= (Date.now() - new Date('2025-07-06').getTime()) / (new Date('2026-01-31').getTime() - new Date('2025-07-06').getTime()) * 100
  };
};

// Enhanced topic recommendation system
export const getRecommendedTopicsForToday = (
  currentDate: Date,
  completedTopics: string[],
  topicsProgress: any,
  availableHours: number
) => {
  const startDate = new Date('2025-07-06');
  const currentWeek = Math.ceil((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  // Get current week topics
  const currentWeekTopics = cppRoadmap.find(w => w.weekNumber === currentWeek)?.topics || [];
  
  // Get urgent topics (from previous weeks that are incomplete)
  const urgentTopics = [];
  for (let week = 1; week < currentWeek; week++) {
    const weekTopics = cppRoadmap.find(w => w.weekNumber === week)?.topics || [];
    weekTopics.forEach(topic => {
      const status = getTopicCompletionStatus(topic.id, completedTopics, topicsProgress);
      if (status.percentage < 100) {
        urgentTopics.push({ ...topic, weekNumber: week, urgencyLevel: 'high' });
      }
    });
  }
  
  // Combine and prioritize
  const allRecommendedTopics = [
    ...urgentTopics,
    ...currentWeekTopics.map(topic => ({ ...topic, weekNumber: currentWeek, urgencyLevel: 'medium' }))
  ];
  
  // Filter out completed topics and sort by priority
  const incompleteTopics = allRecommendedTopics.filter(topic => {
    const status = getTopicCompletionStatus(topic.id, completedTopics, topicsProgress);
    return status.percentage < 100;
  });
  
  // Limit based on available hours (1 topic per 2-3 hours)
  const maxTopics = Math.max(1, Math.floor(availableHours / 2));
  
  return incompleteTopics.slice(0, maxTopics);
}; 