package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID string) (string, error) {
	jwtSecret := GetSecretKeyFromEnv()
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Minute * 10).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func VerifyJWT(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, jwtSecretKeyFunc)
	if err != nil || !token.Valid {
		return "", err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("could not parse claims")
	}

	userID, ok := claims["user_id"].(string)
	if !ok {
		return "", errors.New("user_id not found in token")
	}

	return userID, nil
}

func jwtSecretKeyFunc(token *jwt.Token) (interface{}, error) {
	jwtSecret := GetSecretKeyFromEnv()
	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, errors.New("unexpected signing method")
	}
	return jwtSecret, nil
}
