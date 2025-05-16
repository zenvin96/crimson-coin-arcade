import React from "react";

const ComingSoon: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h1 className="text-4xl font-bold mb-4">🚧</h1>
      <h2 className="text-2xl font-semibold mb-2">功能正在开发中</h2>
      <p className="text-lg text-muted-foreground">敬请期待！</p>
    </div>
  );
};

export default ComingSoon;
