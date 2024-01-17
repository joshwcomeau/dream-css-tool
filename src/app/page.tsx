import styled from '../styled.js';

export default function Home() {
  return (
    <main>
      <Button>Hello World</Button>
    </main>
  );
}

const Button = styled(
  'button',
  `
  color: red;
`
);
