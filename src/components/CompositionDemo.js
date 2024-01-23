import React from 'react';
import styled from '../styled';

export default function ComponentsInterpolationDemo() {
  return (
    <OuterWrapper>
      <Wrapper>
        <TextWrapper>
          Components interpolation demo with wrapper
          <Emoji>😅</Emoji>
        </TextWrapper>
      </Wrapper>
      <TextWrapper>
        Components interpolation demo without wrapper
        <Emoji>😅</Emoji>
      </TextWrapper>
    </OuterWrapper>
  );
}

const OuterWrapper = styled.div`
  border: 1px solid red;
  border-radius: 8px;
`;

const Wrapper = styled.div`
  background-color: hsl(180deg 80% 40%);
  border-radius: 8px;
`;

const Emoji = styled.span`
  transition: transform 200ms;
  display: block;

  ${Wrapper} & {
    transform: rotate(180deg);
  }
`;

const TextWrapper = styled.span`
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  padding: 12px;

  &:hover {
    color: hsl(350deg 100% 40%);
  }

  &:hover ${Emoji} {
    transform: scale(1.3);
  }
`;
