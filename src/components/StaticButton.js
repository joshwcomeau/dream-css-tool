import React from 'react';
import styled from '../styled.js';

export default function StaticButton() {
  return <OtherButton>Static Button</OtherButton>;
}

const Button = styled.button`
  display: block;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  background: hsl(270deg 100% 30%);
  color: white;
  font-size: 1rem;
  cursor: pointer;
`;

const OtherButton = styled(Button)`
  color: red;
`;
