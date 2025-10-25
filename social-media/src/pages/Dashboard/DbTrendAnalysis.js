import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const InstagramAnalysis = () => {
    const [profile, setProfile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const analysisRef = useRef(null); // Store last stable data

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileRes = await axios.get("http://127.0.0.1:8000/profile");
                const mediaRes = await axios.get("http://127.0.0.1:8000/media");
                const analysisRes = await axios.post("http://127.0.0.1:8000/analyze", mediaRes.data);

                setProfile(profileRes.data);
                setAnalysis(analysisRes.data);
                analysisRef.current = analysisRes.data; // Store stable data
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []); // Run only once on mount

    // Use last available data to prevent flashing
    const stableAnalysis = analysis || analysisRef.current;

    if (!profile || !stableAnalysis) return (
        <div style={styles.loadingContainer}>Loading...</div>
    );

    // Bar Chart Data for Engagement
    const barChartData = {
        labels: ["Average Likes", "Average Comments"],
        datasets: [
            {
                label: "Engagement",
                data: [stableAnalysis.avg_likes, stableAnalysis.avg_comments],
                backgroundColor: ["#4F46E5", "#8B5CF6"],
                borderRadius: 8,
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    // Pie Chart Data for Word Frequency
    const pieChartData = {
        labels: Object.keys(stableAnalysis.word_freq),
        datasets: [
            {
                label: "Word Frequency",
                data: Object.values(stableAnalysis.word_freq),
                backgroundColor: [
                    "#4F46E5", "#8B5CF6", "#EC4899", "#F43F5E", "#F59E0B",
                    "#10B981", "#06B6D4", "#6366F1", "#8B5CF6", "#D946EF"
                ],
                borderWidth: 2,
                borderColor: '#0F172A',
                hoverBorderWidth: 0,
                hoverOffset: 15
            },
        ],
    };

    // Line Chart Data for Sentiment Analysis
   
    // Pie Chart Data for Content Types
    const contentTypesData = {
        labels: Object.keys(stableAnalysis.content_types),
        datasets: [
            {
                label: "Content Types",
                data: Object.values(stableAnalysis.content_types),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800"
                ],
            },
        ],
    };

    // Pie Chart Data for Sentiment Categories
    const sentimentCategoriesData = {
        labels: Object.keys(stableAnalysis.sentiment_categories),
        datasets: [
            {
                label: "Sentiment Categories",
                data: Object.values(stableAnalysis.sentiment_categories),
                backgroundColor: [
                    "#66b3ff", "#99ff99", "#ff9999"
                ],
            },
        ],
    };

    // Pie Chart Data for Top Hashtags
    const topHashtagsData = {
        labels: Object.keys(stableAnalysis.top_hashtags),
        datasets: [
            {
                label: "Top Hashtags",
                data: Object.values(stableAnalysis.top_hashtags),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800"
                ],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    color: '#E2E8F0',
                    padding: 25,
                    font: {
                        size: 13,
                        family: "'Inter', sans-serif"
                    },
                    usePointStyle: true, // Makes legend items use circular points
                    boxWidth: 8
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: {
                    size: 14,
                    family: "'Inter', sans-serif",
                    weight: '600'
                },
                bodyFont: {
                    size: 13,
                    family: "'Inter', sans-serif"
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                borderColor: '#334155',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: {
                    color: '#1E293B',
                    drawBorder: false
                },
                ticks: {
                    color: '#94A3B8',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: 8
                }
            },
            y: {
                grid: {
                    color: '#1E293B',
                    drawBorder: false
                },
                ticks: {
                    color: '#94A3B8',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: 8
                }
            }
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>{profile.username}'s Analytics</h1>
                <p style={styles.subtitle}>Media Count: {profile.media_count}</p>
            </div>

            <div style={styles.chartsContainer}>
                {/* Engagement Analysis */}
                <div style={styles.chartCard}>
                    <h2 style={styles.chartTitle}>Engagement Analysis</h2>
                    <div style={styles.chartWrapper}>
                        <Bar data={barChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Word Frequency */}
                <div style={styles.chartCard}>
                    <h2 style={styles.chartTitle}>Most Common Words</h2>
                    <div style={styles.chartWrapper}>
                        <Pie data={pieChartData} options={chartOptions} />
                    </div>
                </div>

               

                {/* Content Types */}
                <div style={styles.chartCard}>
                    <h2 style={styles.chartTitle}>Content Distribution</h2>
                    <div style={styles.chartWrapper}>
                        <Pie data={contentTypesData} options={chartOptions} />
                    </div>
                </div>

                {/* Sentiment Categories */}
                <div style={styles.chartCard}>
                    <h2 style={styles.chartTitle}>Sentiment Categories</h2>
                    <div style={styles.chartWrapper}>
                        <Pie data={sentimentCategoriesData} options={chartOptions} />
                    </div>
                </div>
            </div>

            {/* Most Liked Post */}
            <div style={styles.mostLikedPost}>
                <h2 style={styles.chartTitle}>Most Liked Post</h2>
                <p style={styles.postCaption}>{stableAnalysis.most_liked_post.caption || "No caption"}</p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        minHeight: '100vh',
        backgroundColor: '#070E1E',
        color: '#E2E8F0',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2rem',
        color: '#E2E8F0',
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: '#94A3B8',
        fontSize: '1.1rem',
    },
    chartsContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // Change to fixed 2 columns
        gap: '2.5rem', // Increased gap
        padding: '2rem', // Increased padding
        maxWidth: '1400px', // Added max width
        margin: '0 auto', // Center the container
        backgroundColor: '#0A1120', // Slightly darker background
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    },
    chartCard: {
        backgroundColor: '#0F172A',
        borderRadius: '16px',
        padding: '2rem', // Increased padding
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        minWidth: '500px', // Added minimum width
        border: '1px solid #1E293B',
        transition: 'transform 0.2s ease',
        ':hover': {
            transform: 'translateY(-4px)'
        }
    },
    fullWidthCard: {
        backgroundColor: '#0F172A',
        borderRadius: '12px',
        padding: '2rem', // Increased padding
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        gridColumn: '1 / -1',
        minHeight: '500px', // Added minimum height
    },
    chartTitle: {
        color: '#E2E8F0',
        fontSize: '1.35rem',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: '0.025em'
    },
    chartWrapper: {
        height: '400px', // Increased height
        position: 'relative',
        margin: '1rem auto', // Added margin
        maxWidth: '600px', // Added maximum width for charts
        padding: '1rem',
        backgroundColor: '#131C2E', // Slightly lighter than card background
        borderRadius: '12px',
        border: '1px solid #1E293B'
    },
    mostLikedPost: {
        backgroundColor: '#0F172A',
        borderRadius: '12px',
        padding: '1.5rem',
        margin: '2rem auto',
        maxWidth: '800px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    },
    postCaption: {
        color: '#94A3B8',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '1rem',
        backgroundColor: '#1E293B',
        borderRadius: '8px',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#070E1E',
        color: '#E2E8F0',
        fontSize: '1.2rem',
    }
};

export default InstagramAnalysis;