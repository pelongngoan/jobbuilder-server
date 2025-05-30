import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (server: HttpServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use((socket: any, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their own room for personal notifications
    socket.join(`user_${socket.userId}`);

    // Join staff to staff room if they are staff
    if (socket.userRole === "staff") {
      socket.join("staff_room");
    }

    // Handle chat events
    socket.on("join_chat", (chatId: string) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    socket.on("leave_chat", (chatId: string) => {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    socket.on("typing", (data: { chatId: string; isTyping: boolean }) => {
      socket.to(`chat_${data.chatId}`).emit("user_typing", {
        userId: socket.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

// Helper functions to emit notifications
export const emitNotification = (
  io: SocketIOServer,
  userId: string,
  notification: any
) => {
  io.to(`user_${userId}`).emit("new_notification", notification);
};

export const emitChatMessage = (
  io: SocketIOServer,
  chatId: string,
  message: any
) => {
  io.to(`chat_${chatId}`).emit("new_message", message);
};

export const emitApplicationUpdate = (
  io: SocketIOServer,
  userId: string,
  application: any
) => {
  io.to(`user_${userId}`).emit("application_update", application);
};

export const emitToStaff = (io: SocketIOServer, data: any, event: string) => {
  io.to("staff_room").emit(event, data);
};
