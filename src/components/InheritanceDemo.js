import React from 'react';
import styled from '../styled.js';

export default function InheritanceDemo() {
  return (
    <Wrapper>
      <ChildButton primary>Primary child Button</ChildButton>
      <ChildButton>Not primary child Button</ChildButton>
      <ParentButton primary>Primary parent Button</ParentButton>
      <ParentButton>Not primary parent Button</ParentButton>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ParentButton = styled.button`
  display: block;
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  background: ${(props) =>
    props.primary ? 'hsl(270deg 100% 30%)' : 'hsl(100deg 100% 30%)'};
  color: white;
  font-size: 1rem;
  cursor: pointer;
`;

const ChildButton = styled(ParentButton)`
  border: 5px solid red;
  color: black;
  font-weight: 600;
`;
