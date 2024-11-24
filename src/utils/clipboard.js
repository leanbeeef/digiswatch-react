// clipboard.js

export const copyColorToClipboard = (color) => {
    navigator.clipboard.writeText(color).then(() => {
        showPopupMessage(`Copied ${color} to clipboard!`);
    }).catch((err) => {
        console.error('Could not copy text:', err);
    });
};

// Function to show a popup message
export const showPopupMessage = (message) => {
    // Create a div for the message
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popup.style.color = 'white';
    popup.style.padding = '15px 30px';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
    popup.style.zIndex = '2000';
    popup.style.fontSize = '1rem';
    popup.style.textAlign = 'center';
    popup.style.animation = 'fadeOut 1.5s ease-out forwards';

    // Append the popup to the body
    document.body.appendChild(popup);

    // Remove the popup after the animation ends
    setTimeout(() => {
        popup.remove();
    }, 1500);
};
