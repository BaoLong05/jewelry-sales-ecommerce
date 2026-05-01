FROM php:8.2-apache

WORKDIR /var/www/html

# Cài dependencies hệ thống cần cho gd + zip
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zlib1g-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Cấu hình và cài extension PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        zip \
        gd

# Bật mod_rewrite cho Laravel route
RUN a2enmod rewrite

# Đổi DocumentRoot sang thư mục public (để Laravel chạy đúng)
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Copy code Laravel vào container
COPY . /var/www/html

# Phân quyền thư mục cần ghi (storage & bootstrap/cache)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

EXPOSE 80

CMD ["apache2-foreground"]