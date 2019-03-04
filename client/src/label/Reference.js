import React, { Component } from 'react';

const containerStyle = {
  flex: '0 0 auto',
  maxHeight: 300,
  padding: '0 10px',
  textAlign: 'center',
  borderBottom: '1px solid #ccc',
};

const imageStyle = {
  margin: '0 auto',
  maxHeight: 250,
};

export default function renderReference({ referenceLink, referenceText }) {
  if (!referenceText && !referenceLink) return null;
  const img = referenceLink ? (
    <img alt="Reference" src={referenceLink} style={imageStyle} />
  ) : null;
  return (
    <div style={containerStyle}>
      {img}
      <p>{referenceText}</p>
    </div>
  );
}
