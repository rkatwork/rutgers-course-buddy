export interface Course {
  code: string;
  title: string;
  credits: number;
  description: string;
  prerequisites: string[];
  campus: string[];
  level: 'introductory' | 'intermediate' | 'advanced';
  genEd?: string[];
}

export const courses: Course[] = [
  {
    code: "CS 111",
    title: "Introduction to Computer Science",
    credits: 4,
    description: "Intensive introduction to computer science. Problem solving through decomposition. Writing, debugging, and analyzing programs in Java. Covers fundamental concepts including conditionals, loops, arrays, and object-oriented programming.",
    prerequisites: [],
    campus: ["New Brunswick", "Newark", "Camden"],
    level: "introductory",
    genEd: ["QQ"]
  },
  {
    code: "CS 112",
    title: "Data Structures",
    credits: 4,
    description: "Study of data structures and algorithms fundamental to computer science. Topics include linked lists, stacks, queues, trees, graphs, sorting, searching, and algorithm analysis.",
    prerequisites: ["CS 111"],
    campus: ["New Brunswick", "Newark", "Camden"],
    level: "intermediate"
  },
  {
    code: "CS 211",
    title: "Computer Architecture",
    credits: 4,
    description: "Introduction to computer architecture and assembly language programming. Topics include data representation, digital logic, processor organization, memory hierarchy, and assembly language programming.",
    prerequisites: ["CS 112"],
    campus: ["New Brunswick", "Newark"],
    level: "intermediate"
  },
  {
    code: "CS 213",
    title: "Software Methodology",
    credits: 4,
    description: "Methodology for software development. Topics include object-oriented design, design patterns, testing, version control, and agile development practices.",
    prerequisites: ["CS 112"],
    campus: ["New Brunswick"],
    level: "intermediate"
  },
  {
    code: "CS 214",
    title: "Systems Programming",
    credits: 4,
    description: "Systems programming in C on Unix. Topics include memory management, file I/O, process control, inter-process communication, and basic networking.",
    prerequisites: ["CS 211"],
    campus: ["New Brunswick"],
    level: "advanced"
  },
  {
    code: "MATH 151",
    title: "Calculus I",
    credits: 4,
    description: "Introduction to differential and integral calculus. Limits, derivatives, applications of differentiation, introduction to integration.",
    prerequisites: [],
    campus: ["New Brunswick", "Newark", "Camden"],
    level: "introductory",
    genEd: ["QQ"]
  },
  {
    code: "MATH 152",
    title: "Calculus II",
    credits: 4,
    description: "Continuation of Calculus I. Techniques of integration, applications of integration, sequences, series, and Taylor polynomials.",
    prerequisites: ["MATH 151"],
    campus: ["New Brunswick", "Newark", "Camden"],
    level: "intermediate",
    genEd: ["QQ"]
  },
  {
    code: "CS 205",
    title: "Introduction to Discrete Structures I",
    credits: 4,
    description: "Mathematical foundations of computer science. Topics include logic, sets, functions, relations, combinatorics, and graph theory.",
    prerequisites: ["CS 111", "MATH 151"],
    campus: ["New Brunswick", "Newark"],
    level: "intermediate"
  },
  {
    code: "CS 336",
    title: "Principles of Information and Data Management",
    credits: 3,
    description: "Principles underlying the design and implementation of database management systems. Topics include the relational model, SQL, normalization, transactions, and indexing.",
    prerequisites: ["CS 112"],
    campus: ["New Brunswick"],
    level: "advanced"
  },
  {
    code: "CS 344",
    title: "Design and Analysis of Computer Algorithms",
    credits: 3,
    description: "Advanced algorithm design and analysis. Topics include divide and conquer, dynamic programming, greedy algorithms, graph algorithms, and NP-completeness.",
    prerequisites: ["CS 112", "CS 205"],
    campus: ["New Brunswick"],
    level: "advanced"
  }
];

export const getCourseByCode = (code: string): Course | undefined => {
  return courses.find(c => c.code.toLowerCase() === code.toLowerCase());
};

export const getCoursesByCampus = (campus: string): Course[] => {
  return courses.filter(c => c.campus.includes(campus));
};

export const searchCourses = (query: string): Course[] => {
  const lowerQuery = query.toLowerCase();
  return courses.filter(c => 
    c.code.toLowerCase().includes(lowerQuery) ||
    c.title.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery)
  );
};
