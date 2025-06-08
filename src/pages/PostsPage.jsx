import React, { useEffect, useState, useMemo } from "react";
import {
    ExternalLink, Linkedin, Twitter, Mail, BookOpen, UserRound, Filter, Calendar, Clock, CheckCircle2, XCircle,
    Search, SortAsc, SortDesc, FileText
} from "lucide-react";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../services/firebase"; // Ensure this path is correct

// Helper function to get the appropriate icon for a platform
const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
        case "linkedin":
            return <Linkedin size={20} className="text-blue-300" />;
        case "twitter":
            return <Twitter size={20} className="text-black dark:text-white" />;
        case "newsletter":
            return <Mail size={20} className="text-purple-400" />;
        case "blog":
            return <BookOpen size={20} className="text-cyan-200" />;
        case "transcript":
            return <FileText size={20} className="text-yellow-200" />;
        default:
            return null;
    }
};

// Helper function to format Firebase Timestamp to a readable date and time string
const formatFirebaseTimestamp = (timestamp, includeTime = true) => {
    if (timestamp instanceof Timestamp) {
        const date = timestamp.toDate();
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            options.hour12 = true;
        }
        return date.toLocaleDateString('en-US', options);
    }
    return 'N/A';
};

// Helper function to get a consistent user color for the card header
// It hashes the email (or any unique string) to pick one of 8 theme-aware colors
const getUserColor = (email) => {
    // We expect 8 distinct --color-card-header-X variables in CSS
    const numColors = 8;
    let hash = 0;
    if (!email) {
        // Fallback for null/undefined/empty email to avoid errors and provide a consistent default color
        email = "default_user";
    }

    for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % numColors;
    // Returns a CSS variable name, e.g., 'var(--color-card-header-1)'
    return `var(--color-card-header-${index + 1})`;
};


export default function ContentLibraryPage() {
    const [generations, setGenerations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('dateDesc'); // 'dateDesc', 'dateAsc', 'nameAsc', 'nameDesc'
    const [activeContentId, setActiveContentId] = useState({ id: null, type: null }); // {id: 'cardId', type: 'blog'}

    useEffect(() => {
        const fetchGenerations = async () => {
            try {
                setLoading(true);
                const generationsCollectionRef = collection(db, "generated_contents");
                const q = query(generationsCollectionRef, orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                const fetchedGenerations = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt,
                        userName: data.name || data.email || "Unknown User",
                        userEmail: data.email || 'N/A', // Crucial: ensure this is unique or handle 'N/A' properly
                        status: data.status || 'unknown',
                        blogContent: data.blog || null,
                        linkedinContent: data.linkedin || null,
                        newsletterContent: data.newsletter || null,
                        twitterContent: data.twitter || null,
                        transcriptContent: data.transcript || null,
                    };
                });
                setGenerations(fetchedGenerations);
            } catch (err) {
                console.error("Error fetching generations:", err);
                setError("Failed to load content. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchGenerations();
    }, []);

    const handleContentToggle = (cardId, contentType) => {
        if (activeContentId.id === cardId && activeContentId.type === contentType) {
            setActiveContentId({ id: null, type: null }); // Collapse if already open
        } else {
            setActiveContentId({ id: cardId, type: contentType }); // Expand
        }
    };

    // Memoized filtered and sorted generations
    const displayedGenerations = useMemo(() => {
        let filtered = generations;

        // Apply date filter
        if (filterDate) {
            filtered = filtered.filter(gen => {
                const genDate = formatFirebaseTimestamp(gen.createdAt, false); // Get date without time
                const filterDateFormatted = new Date(filterDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                return genDate === filterDateFormatted;
            });
        }

        // Apply search term filter
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(gen =>
                gen.userName.toLowerCase().includes(lowerCaseSearchTerm) ||
                gen.userEmail.toLowerCase().includes(lowerCaseSearchTerm) ||
                (gen.blogContent && gen.blogContent.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (gen.linkedinContent && gen.linkedinContent.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (gen.newsletterContent && gen.newsletterContent.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (gen.twitterContent && gen.twitterContent.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (gen.transcriptContent && gen.transcriptContent.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        // Apply sorting
        return filtered.sort((a, b) => {
            if (sortBy === 'dateDesc') {
                return b.createdAt.toDate() - a.createdAt.toDate();
            } else if (sortBy === 'dateAsc') {
                return a.createdAt.toDate() - b.createdAt.toDate();
            } else if (sortBy === 'nameAsc') {
                return a.userName.localeCompare(b.userName);
            } else if (sortBy === 'nameDesc') {
                return b.userName.localeCompare(a.userName);
            }
            return 0;
        });
    }, [generations, filterDate, searchTerm, sortBy]);

    if (loading) {
        return (
            <p className="text-center text-xl animate-pulse text-[var(--color-text-soft)] p-8">
                Loading content library...
            </p>
        );
    }

    if (error) {
        return (
            <p className="text-center text-xl text-[var(--color-danger)] animate-fade-in p-8">
                {error}
            </p>
        );
    }

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8 animate-fade-in">
            <h2 className="text-4xl font-extrabold text-center mb-8 text-[var(--color-text)]">
                Content Library
            </h2>

            {/* Controls Section: Filter, Sort, Search */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 p-4 bg-[var(--color-card-bg)] rounded-lg shadow-md border border-[var(--color-border)]">
                {/* Date Filter */}
                <div className="flex items-center">
                    <label htmlFor="filterDate" className="mr-2 text-[var(--color-text-soft)] font-medium flex items-center">
                        <Calendar size={18} className="mr-1 text-[var(--color-primary)]" /> Date:
                    </label>
                    <input
                        type="date"
                        id="filterDate"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="p-2 border border-[var(--color-input-border)] rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition duration-200 bg-[var(--color-input-bg)] text-[var(--color-text)]"
                    />
                    {filterDate && (
                        <button
                            onClick={() => setFilterDate('')}
                            className="ml-2 px-3 py-1.5 bg-[var(--color-border)] text-[var(--color-text-soft)] rounded-md hover:bg-[var(--color-sidebar-hover)] transition-colors duration-200"
                            title="Clear date filter"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Sort By */}
                <div className="flex items-center">
                    <label htmlFor="sortBy" className="mr-2 text-[var(--color-text-soft)] font-medium flex items-center">
                        <Filter size={18} className="mr-1 text-[var(--color-accent)]" /> Sort By:
                    </label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="p-2 border border-[var(--color-input-border)] rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-input-bg)] text-[var(--color-text)] transition duration-200"
                    >
                        <option value="dateDesc">Date (Newest First)</option>
                        <option value="dateAsc">Date (Oldest First)</option>
                        <option value="nameAsc">User Name (A-Z)</option>
                        <option value="nameDesc">User Name (Z-A)</option>
                    </select>
                </div>

                {/* Search */}
                <div className="relative flex-grow max-w-sm">
                    <input
                        type="text"
                        placeholder="Search by user or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-[var(--color-input-border)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition duration-200 bg-[var(--color-input-bg)] text-[var(--color-text)]"
                    />
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-soft)]" />
                </div>
            </div>

            {displayedGenerations.length === 0 ? (
                <p className="text-center text-lg text-[var(--color-text-soft)] p-8">
                    No content found matching your criteria.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedGenerations.map((gen) => (
                        <div
                            key={gen.id}
                            className="bg-[var(--color-card-bg)] rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:scale-[1.02] transition-transform duration-300 animate-slide-up border border-[var(--color-border)]"
                        >
                            {/* Card Header with user info and dynamic color */}
                            {/* Using inline style for dynamic background color from CSS variable */}
                            <div
                                // This is where the magic happens: getUserColor returns a CSS variable string
                                // which is then applied as the background color.
                                style={{ backgroundColor: getUserColor(gen.userEmail) }}
                                className="text-white p-4 flex flex-col items-center justify-center"
                            >
                                <UserRound size={36} className="mb-2" />
                                <h3 className="text-xl font-bold truncate w-full text-center">{gen.userName}</h3>
                                <p className="text-sm opacity-90 truncate w-full text-center">{gen.userEmail}</p>
                            </div>

                            {/* Card Body with Date, Time, Status */}
                            <div className="p-4 flex-grow">
                                <div className="flex justify-between items-center text-sm text-[var(--color-text-soft)] mb-3">
                                    <span className="flex items-center">
                                        <Clock size={16} className="mr-1 text-[var(--color-accent)]" />
                                        {formatFirebaseTimestamp(gen.createdAt)}
                                    </span>
                                    <span className={`flex items-center font-semibold ${gen.status === 'Not published' || gen.status === 'not published' ? 'text-[var(--color-warning)]' : 'text-[var(--color-success)]'}`}>
                                        {gen.status === 'not published' ? <XCircle size={16} className="mr-1" /> : <CheckCircle2 size={16} className="mr-1" />}
                                        {gen.status.replace('-', ' ')}
                                    </span>
                                </div>

                                {/* Content Buttons */}
                                <div className="flex flex-wrap gap-2 mt-4 border-t pt-4 border-[var(--color-border)]">
                                    {gen.blogContent && (
                                        <button
                                            onClick={() => handleContentToggle(gen.id, 'blog')}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center
                                                        ${activeContentId.id === gen.id && activeContentId.type === 'blog' ? 'bg-[var(--color-primary)] text-[var(--color-card-bg)]' : 'bg-[var(--color-sidebar-hover)] text-[var(--color-text-soft)] hover:bg-[var(--color-border)]'}`}
                                        >
                                            {getPlatformIcon('blog')} <span className="ml-1">Blog</span>
                                        </button>
                                    )}
                                    {gen.linkedinContent && (
                                        <button
                                            onClick={() => handleContentToggle(gen.id, 'linkedin')}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center
                                                        ${activeContentId.id === gen.id && activeContentId.type === 'linkedin' ? 'bg-[var(--color-primary)] text-[var(--color-card-bg)]' : 'bg-[var(--color-sidebar-hover)] text-[var(--color-text-soft)] hover:bg-[var(--color-border)]'}`}
                                        >
                                            {getPlatformIcon('linkedin')} <span className="ml-1">LinkedIn</span>
                                        </button>
                                    )}
                                    {gen.twitterContent && (
                                        <button
                                            onClick={() => handleContentToggle(gen.id, 'twitter')}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center
                                                        ${activeContentId.id === gen.id && activeContentId.type === 'twitter' ? 'bg-[var(--color-primary)] text-[var(--color-card-bg)]' : 'bg-[var(--color-sidebar-hover)] text-[var(--color-text-soft)] hover:bg-[var(--color-border)]'}`}
                                        >
                                            {getPlatformIcon('twitter')} <span className="ml-1">Twitter</span>
                                        </button>
                                    )}
                                    {gen.newsletterContent && (
                                        <button
                                            onClick={() => handleContentToggle(gen.id, 'newsletter')}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center
                                                        ${activeContentId.id === gen.id && activeContentId.type === 'newsletter' ? 'bg-[var(--color-primary)] text-[var(--color-card-bg)]' : 'bg-[var(--color-sidebar-hover)] text-[var(--color-text-soft)] hover:bg-[var(--color-border)]'}`}
                                        >
                                            {getPlatformIcon('newsletter')} <span className="ml-1">Newsletter</span>
                                        </button>
                                    )}
                                    {gen.transcriptContent && (
                                        <button
                                            onClick={() => handleContentToggle(gen.id, 'transcript')}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 flex items-center
                                                        ${activeContentId.id === gen.id && activeContentId.type === 'transcript' ? 'bg-[var(--color-primary)] text-[var(--color-card-bg)]' : 'bg-[var(--color-sidebar-hover)] text-[var(--color-text-soft)] hover:bg-[var(--color-border)]'}`}
                                        >
                                            {getPlatformIcon('transcript')} <span className="ml-1">Transcript</span>
                                        </button>
                                    )}
                                </div>

                                {/* Display Selected Content */}
                                {activeContentId.id === gen.id && (
                                    <div className="mt-4 p-3 bg-[var(--color-background)] rounded-md border border-[var(--color-border)] animate-fade-in text-[var(--color-text)] text-sm max-h-40 overflow-y-auto custom-scrollbar">
                                        {activeContentId.type === 'blog' && gen.blogContent && (
                                            <p className="whitespace-pre-wrap">{gen.blogContent}</p>
                                        )}
                                        {activeContentId.type === 'linkedin' && gen.linkedinContent && (
                                            <p className="whitespace-pre-wrap">{gen.linkedinContent}</p>
                                        )}
                                        {activeContentId.type === 'twitter' && gen.twitterContent && (
                                            <p className="whitespace-pre-wrap">{gen.twitterContent}</p>
                                        )}
                                        {activeContentId.type === 'newsletter' && gen.newsletterContent && (
                                            <p className="whitespace-pre-wrap">{gen.newsletterContent}</p>
                                        )}
                                        {activeContentId.type === 'transcript' && gen.transcriptContent && (
                                            <p className="whitespace-pre-wrap">{gen.transcriptContent}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}