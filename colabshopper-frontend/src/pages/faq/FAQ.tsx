import React, { useState } from 'react';
import './FAQ.css';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqData: FAQItem[] = [
    {
      question: "What is ColabShopper?",
      answer: "ColabShopper is a collaborative shopping list application that allows you to create, share, and manage shopping lists with friends and family in real-time. Never forget items or duplicate purchases again!"
    },
    {
      question: "How do I create a shopping list?",
      answer: "Simply click the 'Create Shopping List' button on the homepage, give your list a name, choose a category, and you're ready to start adding items. You can then invite others to collaborate on your list."
    },
    {
      question: "Can I share my lists with others?",
      answer: "Yes! You can invite friends and family to collaborate on your shopping lists. Everyone with access can add, edit, and check off items in real-time."
    },
    {
      question: "Is ColabShopper free to use?",
      answer: "Yes, ColabShopper is completely free to use. Create as many lists as you need and invite as many collaborators as you want."
    },
    {
      question: "How do I invite someone to my list?",
      answer: "After creating a list, you'll find a 'Share' button. Click it to generate a unique link or enter email addresses to send invitations directly."
    },
    {
      question: "Can I use ColabShopper offline?",
      answer: "ColabShopper requires an internet connection to sync changes in real-time with your collaborators. However, you can view previously loaded lists offline."
    },
    {
      question: "How do I delete a list?",
      answer: "Open the list you want to delete, click the settings icon (three dots), and select 'Delete List'. Note that this action cannot be undone."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! We take your privacy seriously. All data is encrypted and your lists are only accessible to you and the people you explicitly invite. Read our Privacy Policy for more details."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about ColabShopper</p>
        </div>

        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <button 
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className="faq-icon"
                >
                  <path 
                    d="M6 9L12 15L18 9" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h2>Still have questions?</h2>
          <p>Feel free to reach out to our support team at support@colabshopper.com</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

