import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rutgers SOC API endpoints
const SOC_BASE_URL = "https://sis.rutgers.edu/soc";

interface RutgersCourse {
  title: string;
  courseNumber: string;
  subject: string;
  subjectDescription: string;
  credits: number;
  creditsText: string;
  expandedTitle: string;
  preReqNotes: string;
  synopsisUrl: string;
  sections: Array<{
    number: string;
    instructorsText: string;
    meetingTimes: Array<{
      meetingDay: string;
      startTime: string;
      endTime: string;
      campusName: string;
      buildingCode: string;
      roomNumber: string;
    }>;
    openStatus: boolean;
    examCode: string;
  }>;
}

interface SOCResponse {
  courses?: RutgersCourse[];
}

// Fetch courses from Rutgers SOC API
async function fetchRutgersCourses(
  campus: string,
  semester: string,
  subject?: string
): Promise<RutgersCourse[]> {
  try {
    // Map campus names to Rutgers codes
    const campusMap: Record<string, string> = {
      "new brunswick": "NB",
      "newark": "NK",
      "camden": "CM",
      "all": "NB", // Default to New Brunswick
    };

    const campusCode = campusMap[campus.toLowerCase()] || "NB";
    
    // Get current semester code (format: 92024 for Fall 2024, 12025 for Spring 2025, etc.)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // 1 = Spring, 7 = Summer, 9 = Fall
    let semesterCode: string;
    if (month >= 0 && month < 5) {
      semesterCode = `1${year}`; // Spring
    } else if (month >= 5 && month < 8) {
      semesterCode = `7${year}`; // Summer
    } else {
      semesterCode = `9${year}`; // Fall
    }

    const url = new URL(`${SOC_BASE_URL}/api/courses.json`);
    url.searchParams.set("year", year.toString());
    url.searchParams.set("term", semesterCode.charAt(0));
    url.searchParams.set("campus", campusCode);
    
    if (subject) {
      url.searchParams.set("subject", subject.toUpperCase());
    }

    console.log(`Fetching from Rutgers SOC: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`SOC API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    console.log(`Received ${Array.isArray(data) ? data.length : 0} courses from SOC`);
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching from Rutgers SOC:", error);
    return [];
  }
}

// Search for specific courses
async function searchCourses(
  query: string,
  campus: string
): Promise<RutgersCourse[]> {
  try {
    // Extract subject code from query (e.g., "CS" from "CS 111" or "computer science")
    const subjectMatch = query.match(/^([A-Za-z]{2,4})\s*\d*/);
    const subject = subjectMatch ? subjectMatch[1].toUpperCase() : undefined;

    // Try to fetch courses for the specific subject
    if (subject) {
      const courses = await fetchRutgersCourses(campus, "", subject);
      
      // Filter by course number if provided
      const courseNumberMatch = query.match(/\d{3}/);
      if (courseNumberMatch && courses.length > 0) {
        return courses.filter(c => c.courseNumber === courseNumberMatch[0]);
      }
      
      return courses.slice(0, 10); // Return top 10
    }

    return [];
  } catch (error) {
    console.error("Error searching courses:", error);
    return [];
  }
}

// Format courses for AI context
function formatCoursesForContext(courses: RutgersCourse[]): string {
  if (courses.length === 0) return "";
  
  return courses.map(course => {
    const sections = course.sections?.slice(0, 3).map(s => {
      const times = s.meetingTimes?.map(mt => 
        `${mt.meetingDay} ${mt.startTime}-${mt.endTime} at ${mt.campusName}`
      ).join(", ") || "TBA";
      return `  - Section ${s.number}: ${s.instructorsText || "Staff"}, ${times}, ${s.openStatus ? "OPEN" : "CLOSED"}`;
    }).join("\n") || "";

    return `
COURSE: ${course.subject}:${course.courseNumber} - ${course.title}
Credits: ${course.creditsText || course.credits}
${course.expandedTitle ? `Full Title: ${course.expandedTitle}` : ""}
${course.preReqNotes ? `Prerequisites: ${course.preReqNotes}` : ""}
${sections ? `Available Sections:\n${sections}` : ""}
`;
  }).join("\n---\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, campus = "all" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get the user's latest message
    const userMessage = messages[messages.length - 1]?.content || "";
    console.log(`Processing query: "${userMessage}" for campus: ${campus}`);

    // Try to fetch relevant course data from Rutgers SOC
    let courseContext = "";
    let dataSourceNote = "";
    
    const courses = await searchCourses(userMessage, campus);
    
    if (courses.length > 0) {
      courseContext = formatCoursesForContext(courses);
      dataSourceNote = `\n\n[Data retrieved from official Rutgers Schedule of Classes API]`;
      console.log(`Found ${courses.length} courses from Rutgers SOC`);
    } else {
      dataSourceNote = `\n\n[Note: Could not retrieve live data from Rutgers Schedule of Classes. Providing general guidance - please verify information at https://sims.rutgers.edu/webreg/ before registration]`;
      console.log("No courses found from SOC API");
    }

    const systemPrompt = `You are the official Rutgers University Course Assistant. You help students with course information, prerequisites, scheduling, and academic planning.

CRITICAL DATA SOURCE RULES:
1. ONLY use data from the official Rutgers Schedule of Classes (SOC) or course catalog
2. If live data was retrieved, use ONLY that data for specific course details
3. If no live data is available, clearly state that you cannot verify current information
4. NEVER fabricate professor names, exact section times, or room numbers
5. NEVER use third-party sources (RateMyProfessor, Reddit, unofficial sites)
6. Always encourage students to verify at sims.rutgers.edu/webreg before registration

RESPONSE FORMAT:
- Use clear bullet points for course information
- Include course codes in format: SUBJECT:NUMBER (e.g., 198:111)
- Mention credits, prerequisites when known
- Be concise but informative
- Use neutral, academic tone
- No emojis, no slang
- If uncertain, clearly state assumptions

CAMPUS CONTEXT: The user is interested in ${campus === "all" ? "all campuses" : campus}

${courseContext ? `LIVE COURSE DATA FROM RUTGERS SOC:\n${courseContext}` : "NO LIVE DATA AVAILABLE - Provide general guidance only"}
${dataSourceNote}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("course-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
