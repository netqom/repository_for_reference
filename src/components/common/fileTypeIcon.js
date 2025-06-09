// utils/fileTypeIcon.js
import React from 'react';

const FileTypeIcon = ({ type }) => {

  switch (type) {
    case 'image':
      return (
        <div>
          <i className="ri-image-fill" style={{ fontSize: 20, marginTop: 4 }}></i>
        </div>
      );
    case 'video':
      return <div>
        <i className="ri-image-video-line" style={{ fontSize: 20, marginTop: 4 }}></i>
      </div>;
    case 'pdf':
      return <div>
        <i className="ri-file-pdf-2-fill" style={{ fontSize: 20, marginTop: 4 }}></i>
      </div>;
    case 'spreadsheet':
      return <div>
        <i className="ri-file-list-3-line" style={{ fontSize: 20, marginTop: 4 }}></i>
      </div>;
    case 'doc':
      return <div>
        <i className="ri-article-line" style={{ fontSize: 20, marginTop: 4 }}></i>
      </div>;
    case 'xls':
      return <div>
        <i className="ri-file-excel-2-line" style={{ fontSize: 20, marginTop: 4 }}></i>
      </div>;
    case 'csv':
      return <div>
        <i className="ri-file-list-3-line" style={{ fontSize: 20, marginTop: 4 }}></i>
      </div>;
    default:
      return <div>
        <i className="ri-article-line" style={{ fontSize: 20, marginTop: 4 }}></i>
      </div>;
  }
};

export default FileTypeIcon;
