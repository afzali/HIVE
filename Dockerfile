# فقط سرور – نه build فرنتم
FROM nginx:alpine

# کانفیگ nginx برای SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# کپی کردن فایل‌های build شده (HTML/CSS/JS)
COPY dist/ /usr/share/nginx/html

EXPOSE 80

# دستور پیش‌فرض nginx
CMD ["nginx", "-g", "daemon off;"]
