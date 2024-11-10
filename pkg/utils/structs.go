package utils

import "database/sql"

type UserObject struct {
	ID                        string
	Username                  string
	Email                     string
	SecurityQuestionsAnswered bool
}

type UserWithRole struct {
	UserObject
	Password                   string
	ApplicationEnvironmentRole string
	InactiveAt                 sql.NullTime
}
