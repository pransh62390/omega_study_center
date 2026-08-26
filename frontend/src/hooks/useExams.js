import { useEffect, useState } from "react";

// Get S3 URL from environment variable
// Set REACT_APP_EXAMS_JSON_URL in .env to point to your S3 JSON file
const defaultFallback = {
  exams: [
    {
      id: "punjab-lecturer-cadre",
      name: "Punjab Lecturer Cadre",
      papers: [],
    },
  ],
};

export default function useExams() {
  const [exams, setExams] = useState(defaultFallback.exams);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read S3 URL from env - fallback to local file for development
  const s3Url = process.env.REACT_APP_EXAMS_JSON_URL;

  useEffect(() => {
    if (s3Url) {
      // Fetch from S3
      fetch(s3Url)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch exams data");
          return res.json();
        })
        .then((data) => {
          setExams(data.exams || data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching exams from S3:", err);
          setError(err);
          // Fallback to local file if S3 fetch fails
          fetch("/data/exams.json")
            .then((res) => res.json())
            .then((data) => {
              setExams(data.exams || data);
              setLoading(false);
            })
            .catch((localErr) => {
              console.error("Local fallback also failed:", localErr);
              setLoading(false);
            });
        });
    } else {
      // Development: load local file from public folder
      fetch("/data/exams.json")
        .then((res) => res.json())
        .then((data) => {
          setExams(data.exams || data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Local file not found:", err);
          setLoading(false);
        });
    }
  }, [s3Url]);

  return { exams, loading, error };
}