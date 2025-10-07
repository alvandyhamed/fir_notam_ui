# ---- Build stage ----
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # نصب وابستگی‌ها با کش بهینه
    COPY package*.json ./
    # برای yarn/pnpm قفل متناظر را کپی کن
    # COPY yarn.lock ./
    # COPY pnpm-lock.yaml ./
    
    RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
    
    # کد برنامه
    COPY . .
    
    # اگر بیلد-آرگ داری (مثلاً VITE_API_URL) اینجا پاس بده
    ARG VITE_API_URL
    ENV VITE_API_URL=${VITE_API_URL}
    
    # بیلد فرانت‌اند (برای CRA هم همین دستور است)
    RUN npm run build
    
    # ---- Runtime stage (Node + serve) ----
    FROM node:20-alpine AS runtime
    WORKDIR /srv
    
    # فقط ابزار اجرای استاتیک را نصب می‌کنیم
    RUN npm i -g serve
    
    # خروجی بیلد را کپی می‌کنیم
    COPY --from=builder /app /tmp/app
    
    # انتخاب خودکار پوشه‌ی خروجی (dist برای Vite، build برای CRA)
    RUN mkdir -p /srv/app \
     && if [ -d /tmp/app/dist ]; then cp -r /tmp/app/dist /srv/app/dist; \
        elif [ -d /tmp/app/build ]; then cp -r /tmp/app/build /srv/app/build; \
        else echo "No build output found (expected dist/ or build/)" && exit 1; fi
    
    ENV PORT=5173
    EXPOSE 5173
    
    # هلس‌چک ساده
    HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:${PORT}/ >/dev/null || exit 1
    
    # اجرای سرور استاتیک
    CMD sh -c '\
      if [ -d /srv/app/dist ]; then \
        serve -s /srv/app/dist -l ${PORT}; \
      elif [ -d /srv/app/build ]; then \
        serve -s /srv/app/build -l ${PORT}; \
      else \
        echo "No build output found (expected dist/ or build/)" && exit 1; \
      fi'