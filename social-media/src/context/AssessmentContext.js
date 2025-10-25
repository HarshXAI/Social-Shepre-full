import React, { createContext, useState } from 'react';

// Create the context
export const AssessmentContext = createContext();

// Create a provider component
export const AssessmentProvider = ({ children }) => {
    // Initial state for questions with each question having a score of 0 initially
    const initialQuestions = [
        { id: 1, question: 'Question 1', score: 0 },
        { id: 2, question: 'Question 2', score: 0 },
        { id: 3, question: 'Question 3', score: 0 },
        { id: 4, question: 'Question 4', score: 0 },
        { id: 5, question: 'Question 5', score: 0 },
        { id: 6, question: 'Question 6', score: 0 },
        { id: 7, question: 'Question 7', score: 0 },
        { id: 8, question: 'Question 8', score: 0 },
        { id: 9, question: 'Question 9', score: 0 },
    ];

    // State to store the assessment questions and their scores
    const [questions, setQuestions] = useState(initialQuestions);
    const [aptitude, setaptitude] = useState(false);
    const [interest, setinterest] = useState(false);
    const [skills, setskills] = useState(false);

    // Function to update the score of a particular question
    const updateScore = (questionId, response) => {
        const updatedQuestions = questions.map((q) => {
            if (q.id === questionId) {
                let score = 0;
                switch (response) {
                    case 'Strongly Agree':
                        score = 5;
                        break;
                    case 'Agree':
                        score = 4;
                        break;
                    case 'Neutral':
                        score = 3;
                        break;
                    case 'Disagree':
                        score = 2;
                        break;
                    case 'Strongly Disagree':
                        score = 1;
                        break;
                    default:
                        score = 0;
                }
                return { ...q, score };
            }
            return q;
        });
        setQuestions(updatedQuestions);
    };

    return (
        <AssessmentContext.Provider value={{ questions, updateScore, aptitude, setaptitude, interest, setinterest, skills, setskills}}>
            {children}
        </AssessmentContext.Provider>
    );
};
