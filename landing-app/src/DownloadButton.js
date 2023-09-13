import React from 'react';

const DownloadButton = () => {
  const downloadFile = () => {
    // Change the filename to match your dist folder or archive file
    const fileName = 'dist.zip';
    const filePath = `/dist/${fileName}`;
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    link.click();
  };

  return (
    <div>
      <button onClick={downloadFile}>Download</button>
    </div>
  );
};

export default DownloadButton;
