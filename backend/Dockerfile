FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

FROM php:8.3-cli-alpine

WORKDIR /app

RUN apk add --no-cache ca-certificates oniguruma-dev \
    && docker-php-ext-install mbstring

COPY --from=vendor /app/vendor ./vendor
COPY . .

EXPOSE 80

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-80} -t /app"]