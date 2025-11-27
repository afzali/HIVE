# مرحله اول: Build کردن اپلیکیشن
FROM node:18-alpine AS builder

WORKDIR /app

# کپی کردن package files
COPY package*.json ./

# نصب dependencies
RUN npm ci

# کپی کردن کل پروژه
COPY . .

# Build کردن اپلیکیشن
RUN npm run build

# مرحله دوم: سرور nginx
FROM nginx:alpine

# کانفیگ nginx برای SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# کپی کردن فایل‌های build شده از مرحله قبل
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

# دستور پیش‌فرض nginx
CMD ["nginx", "-g", "daemon off;"]
