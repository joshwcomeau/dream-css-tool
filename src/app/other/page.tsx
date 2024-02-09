import React from 'react';
import Link from "next/link"

import CountButton from '@/components/CountButton';
import StaticButton from '@/components/StaticButton';
import styled from '@/styled.js';

export default function Home() {
  return (
    <Wrapper>
      <Heading>Another page</Heading>
      {/*
        Uncomment this line to see the issue with Client Components:
      */}
      <CountButton />
      <StaticButton />
      <Link href="/">Home</Link>
    </Wrapper>
  );
}

const Wrapper = styled('main')`
  max-width: 38rem;
  margin: 0 auto;
  padding: 32px;
  border: 1px solid silver;
  border-radius: 8px;
`;

const Heading = styled('h1')`
  font-size: 1.5rem;
  margin: 0;
  margin-bottom: 1em;
`;
