import { courses, getCourseByCode, searchCourses, getCoursesByCampus, Course } from "@/data/courseData";

const formatCourse = (course: Course): string => {
  const prereqs = course.prerequisites.length > 0 
    ? course.prerequisites.join(", ") 
    : "None";
  
  const campuses = course.campus.join(", ");
  const genEd = course.genEd?.join(", ") || "None";
  
  return `**${course.code}: ${course.title}**

• Credits: ${course.credits}
• Level: ${course.level.charAt(0).toUpperCase() + course.level.slice(1)}
• Prerequisites: ${prereqs}
• Campuses: ${campuses}
• Gen Ed: ${genEd}

${course.description}`;
};

const compareCourses = (course1: Course, course2: Course): string => {
  return `**Comparison: ${course1.code} vs ${course2.code}**

**${course1.code}: ${course1.title}**
• Credits: ${course1.credits}
• Level: ${course1.level}
• Prerequisites: ${course1.prerequisites.length > 0 ? course1.prerequisites.join(", ") : "None"}

**${course2.code}: ${course2.title}**
• Credits: ${course2.credits}
• Level: ${course2.level}
• Prerequisites: ${course2.prerequisites.length > 0 ? course2.prerequisites.join(", ") : "None"}

**Key Differences:**
${course1.code} focuses on ${course1.title.toLowerCase()}, while ${course2.code} covers ${course2.title.toLowerCase()}. ${course2.code} typically builds upon concepts from ${course1.code} and goes into greater depth.`;
};

export const generateResponse = (userMessage: string, selectedCampus: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for course code patterns (e.g., CS 111, MATH 151)
  const courseCodePattern = /([a-z]{2,4})\s*(\d{3})/gi;
  const matches = [...lowerMessage.matchAll(courseCodePattern)];
  
  if (matches.length >= 2) {
    // Comparison request
    const code1 = `${matches[0][1].toUpperCase()} ${matches[0][2]}`;
    const code2 = `${matches[1][1].toUpperCase()} ${matches[1][2]}`;
    const course1 = getCourseByCode(code1);
    const course2 = getCourseByCode(code2);
    
    if (course1 && course2) {
      return compareCourses(course1, course2);
    }
  }
  
  if (matches.length === 1) {
    const code = `${matches[0][1].toUpperCase()} ${matches[0][2]}`;
    const course = getCourseByCode(code);
    
    if (course) {
      if (lowerMessage.includes("prerequisite") || lowerMessage.includes("prereq")) {
        if (course.prerequisites.length === 0) {
          return `**${course.code}: ${course.title}** has no prerequisites. It is an introductory course suitable for students beginning their studies in this area.`;
        }
        return `**Prerequisites for ${course.code}: ${course.title}**\n\n${course.prerequisites.map(p => `• ${p}`).join("\n")}\n\nYou must complete these courses before enrolling in ${course.code}.`;
      }
      return formatCourse(course);
    } else {
      return `I don't have information about ${code} in my database. Please check the course code or try another course.`;
    }
  }
  
  // Campus-specific queries
  if (lowerMessage.includes("newark") || lowerMessage.includes("new brunswick") || lowerMessage.includes("camden")) {
    let campus = "New Brunswick";
    if (lowerMessage.includes("newark")) campus = "Newark";
    if (lowerMessage.includes("camden")) campus = "Camden";
    
    if (lowerMessage.includes("cs") || lowerMessage.includes("computer science")) {
      const campusCourses = getCoursesByCampus(campus).filter(c => c.code.startsWith("CS"));
      if (campusCourses.length > 0) {
        return `**Computer Science Courses at ${campus}:**\n\n${campusCourses.map(c => `• **${c.code}**: ${c.title} (${c.credits} credits)`).join("\n")}\n\nWould you like details about any specific course?`;
      }
    }
  }
  
  // Search by keywords
  const searchResults = searchCourses(userMessage);
  if (searchResults.length > 0) {
    if (searchResults.length === 1) {
      return formatCourse(searchResults[0]);
    }
    return `I found ${searchResults.length} courses matching your query:\n\n${searchResults.slice(0, 5).map(c => `• **${c.code}**: ${c.title}`).join("\n")}\n\nWhich course would you like to know more about?`;
  }
  
  // Difficulty questions
  if (lowerMessage.includes("hard") || lowerMessage.includes("difficult") || lowerMessage.includes("easy")) {
    return `Course difficulty is subjective and depends on your background. Generally:\n\n• **Introductory courses** (like CS 111, MATH 151) are designed for beginners\n• **Intermediate courses** require foundational knowledge\n• **Advanced courses** assume mastery of prerequisites\n\nWhich specific course would you like to know about? I can provide more details about its prerequisites and content.`;
  }
  
  // Electives
  if (lowerMessage.includes("elective")) {
    const advancedCourses = courses.filter(c => c.level === "advanced");
    return `**Elective Recommendations:**\n\n${advancedCourses.map(c => `• **${c.code}**: ${c.title}`).join("\n")}\n\nThese advanced courses can serve as electives for CS majors. Would you like details about any of these?`;
  }
  
  // Default response
  return `I can help you with information about Rutgers courses. Try asking about:\n\n• A specific course (e.g., "What is CS 111?")\n• Prerequisites (e.g., "What are the prereqs for CS 112?")\n• Courses at a specific campus (e.g., "CS courses in Newark")\n• Course comparisons (e.g., "Compare CS 111 and CS 112")\n\nWhat would you like to know?`;
};
