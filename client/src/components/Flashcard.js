import React, { useState } from 'react';
import { Card, Container} from 'react-bootstrap';
import { motion } from 'framer-motion';

const Flashcard = ({ question, answer, onEdit,onToggleBookmark, bookmarked }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped((prev) => !prev);
  };

  // Handle right-click (context menu) event
  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent the default context menu from appearing
    onEdit();  // Trigger the edit action passed from the parent (Vault)
  };

  return (
    <Container className="d-flex justify-content-center align-items-center my-4">
      {/* Flashcard container */}
      <motion.div
        className="position-relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}  // Right-click event for editing
        style={{ 
          perspective: '1000px', 
          width: '300px', 
          height: '200px',
          cursor: 'pointer'
        }}
      >
        <motion.div
          className="w-100 h-100"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front - Question */}
          <Card
            bg="primary"
            text="white"
            className="text-center position-absolute"
            style={{
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden'
            }}
          >
            <Card.Body>
              <Card.Title>Question</Card.Title>
              <Card.Text>{question}</Card.Text>
            </Card.Body>
          </Card>

          {/* Back - Answer */}
          <Card
            bg="success"
            text="white"
            className="text-center position-absolute"
            style={{
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <Card.Body>
              <Card.Title>Answer</Card.Title>
              <Card.Text>{answer}</Card.Text>
            </Card.Body>
          </Card>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default Flashcard;
