// src/utils/avatarImages.js
const avatars = Array.from({ length: 32 }, (_, i) => ({
    id: i + 1,
    src: `/avatars/avatar (${i + 1}).png`,
  }));
  
  export default avatars;