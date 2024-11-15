// clipboard.js

export const copyColorToClipboard = (color) => {
    navigator.clipboard.writeText(color).then(() => {
      alert(`Copied ${color} to clipboard!`);
    }).catch((err) => {
      console.error('Could not copy text:', err);
    });
  };