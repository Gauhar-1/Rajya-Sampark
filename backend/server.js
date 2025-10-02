import socket from './socket.js';

const PORT = process.env.PORT || 5000;

socket.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
