FROM node:20-alpine

WORKDIR /app

# فقط فایل‌های قفل و package.json برای کش بهتر
COPY package*.json ./
# اگر yarn/pnpm داری به جای بالا:
# COPY yarn.lock ./
# COPY pnpm-lock.yaml ./

# نصب اولیه (ممکنه بعداً با volume override بشه؛ در compose هندل می‌کنیم)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# برای dev داخل کانتینر
ENV HOST=0.0.0.0
EXPOSE 5173

# پیش‌فرض: Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]