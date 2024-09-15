package main

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/huh"
	_ "github.com/mattn/go-sqlite3"
)

type model struct {
	spinner spinner.Model
	choice  string
	done    bool
	err     error
}

func initialModel() model {
	s := spinner.New()
	s.Spinner = spinner.Dot
	return model{spinner: s}
}

func (m model) Init() tea.Cmd {
	return m.spinner.Tick
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.Type == tea.KeyCtrlC {
			return m, tea.Quit
		}
	case spinner.TickMsg:
		var cmd tea.Cmd
		m.spinner, cmd = m.spinner.Update(msg)
		return m, cmd
	case dbActionMsg:
		m.done = true
		m.err = msg.err
		return m, tea.Quit
	}
	return m, nil
}

func (m model) View() string {
	if m.done {
		if m.err != nil {
			return fmt.Sprintf("Error: %v\n", m.err)
		}
		return "Operation completed successfully!\n"
	}
	return fmt.Sprintf("%s Working...\n", m.spinner.View())
}

type dbActionMsg struct {
	err error
}

func createDatabase(name string) tea.Cmd {
	return func() tea.Msg {
		db, err := sql.Open("sqlite3", name)
		if err != nil {
			return dbActionMsg{err: err}
		}
		defer db.Close()

		// read from schema.sql
		schema, err := os.ReadFile("schema.sql")
		if err != nil {
			return dbActionMsg{err: err}
		}
		_, err = db.Exec(string(schema))
		if err != nil {
			return dbActionMsg{err: err}
		}

		time.Sleep(2 * time.Second) // Simulate some work
		return dbActionMsg{err: nil}
	}
}

func dropDatabase(name string) tea.Cmd {
	return func() tea.Msg {
		err := os.Remove(name)
		if err != nil && !os.IsNotExist(err) {
			return dbActionMsg{err: err}
		}
		time.Sleep(2 * time.Second) // Simulate some work
		return dbActionMsg{err: nil}
	}
}

func main() {
	var choice string

	form := huh.NewForm(
		huh.NewGroup(
			huh.NewSelect[string]().
				Title("Choose an action:").
				Options(
					huh.NewOption("Create production database", "create_prod"),
					huh.NewOption("Create development database", "create_dev"),
					huh.NewOption("Drop development database", "drop_dev"),
				).
				Value(&choice),
		),
	)

	err := form.Run()
	if err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}

	m := initialModel()
	var cmd tea.Cmd

	switch choice {
	case "create_prod":
		fmt.Println("Creating prod database...")
		cmd = createDatabase("prod.db")
	case "create_dev":
		fmt.Println("Creating dev database...")
		cmd = createDatabase("dev.db")
	case "drop_dev":
		fmt.Println("Dropping dev database...")
		cmd = dropDatabase("dev.db")
	}

	m.choice = choice
	p := tea.NewProgram(m)
	go func() {
		p.Send(cmd())
	}()
	if _, err := p.Run(); err != nil {
		fmt.Println("Error running program:", err)
		os.Exit(1)
	}
}
