import React from 'react';
import styled from '../styled.js';

export default function StaticButton() {
  return <Button primary>Static Button</Button>;
}

const Button = styled.button`
  display: block;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  background: ${(props) =>
    props.primary ? 'hsl(270deg 100% 30%)' : 'hsl(180deg 100% 30%)'};
  color: white;
  font-size: 1rem;
  cursor: pointer;
`;
