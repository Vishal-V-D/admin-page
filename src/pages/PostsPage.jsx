// src/pages/PostsPage.jsx
import React, { useEffect, useState } from "react";
import { ExternalLink, Linkedin, Twitter, Mail, BookOpen } from "lucide-react"; // Icons for platforms

// Mock data - In a real app, you would fetch this from Firebase Firestore
const mockPosts = [
  {
    id: "post1",
    userId: "user123",
    userName: "Alice Smith", // Added for display
    platform: "linkedin",
    title: "Exciting New AI Trends in 2025",
    link: "https://www.linkedin.com/feed/update/example-post-1",
    timestamp: new Date("2025-05-30T10:00:00Z"),
  },
  {
    id: "post2",
    userId: "user124",
    userName: "Bob Johnson",
    platform: "x", // Formerly Twitter
    title: "Quick thoughts on the latest JavaScript update #dev #webdev",
    link: "https://x.com/yourhandle/status/example-post-2",
    timestamp: new Date("2025-05-28T15:30:00Z"),
  },
  {
    id: "post3",
    userId: "user123",
    userName: "Alice Smith",
    platform: "blog",
    title: "Deep Dive into Serverless Architectures",
    link: "https://yourblog.com/serverless-deep-dive",
    timestamp: new Date("2025-05-25T08:00:00Z"),
  },
  {
    id: "post4",
    userId: "user125",
    userName: "Charlie Brown",
    platform: "newsletter",
    title: "Weekly Frontend Newsletter - Issue #7",
    link: "https://newsletter.com/issue7",
    timestamp: new Date("2025-05-22T12:00:00Z"),
  },
  {
    id: "post5",
    userId: "user124",
    userName: "Bob Johnson",
    platform: "linkedin",
    title: "Future of Quantum Computing: My Take",
    link: "https://www.linkedin.com/feed/update/example-post-5",
    timestamp: new Date("2025-05-20T09:45:00Z"),
  },
];

const getPlatformIcon = (platform) => {
  switch (platform.toLowerCase()) {
    case "linkedin":
      return <Linkedin size={20} className="text-blue-600" />;
    case "x": // For Twitter
      return <Twitter size={20} className="text-black dark:text-white" />;
    case "newsletter":
      return <Mail size={20} className="text-purple-500" />;
    case "blog":
      return <BookOpen size={20} className="text-green-500" />;
    default:
      return null;
  }
};

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      // In a real app: fetch from Firestore, e.g.,
      // getDocs(collection(db, "posts")).then(snapshot => {
      //   const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      //   setPosts(fetchedPosts.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()));
      // });

      // Using mock data for demonstration
      setPosts(mockPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      setLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  if (loading) {
    return (
      <p
        className="text-center text-xl animate-fadeIn"
        style={{ color: "var(--color-text-soft)" }}
      >
        Loading posts...
      </p>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2
        className="text-4xl font-extrabold text-center mb-8"
        style={{ color: "var(--color-text)" }}
      >
        User Posts Overview
      </h2>

      {posts.length === 0 ? (
        <p className="text-center text-lg" style={{ color: "var(--color-text-soft)" }}>
          No posts available.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-6 rounded-lg shadow-lg flex flex-col justify-between
                         transform hover:scale-[1.02] transition-transform duration-300"
              style={{
                backgroundColor: "var(--color-card-bg)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div>
                <div className="flex items-center mb-3">
                  {getPlatformIcon(post.platform)}
                  <span
                    className="ml-2 text-sm font-semibold capitalize"
                    style={{ color: "var(--color-text-soft)" }}
                  >
                    {post.platform}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-primary)" }}>
                  {post.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--color-text-soft)" }}>
                  Posted by: <span className="font-medium" style={{ color: "var(--color-text)" }}>{post.userName || 'Unknown User'}</span>
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-soft)" }}>
                  {post.timestamp.toLocaleString()}
                </p>
              </div>
              <div className="mt-4">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-500 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  View Post
                  <ExternalLink size={16} className="ml-2" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}