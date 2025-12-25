import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{statusCode ? `Error ${statusCode}` : 'An error occurred'}</h1>
      <p>
        {statusCode === 404
          ? 'The page you are looking for does not exist.'
          : 'Sorry, something went wrong.'}
      </p>
    </main>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
