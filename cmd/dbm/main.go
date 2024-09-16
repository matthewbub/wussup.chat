package main

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/table"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/lipgloss"
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
	return fmt.Sprintf("%s Press esc to exit\n", m.spinner.View())
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

		// time.Sleep(2 * time.Second) // Simulate some work
		return dbActionMsg{err: nil}
	}
}

func dropDatabase(name string) tea.Cmd {
	return func() tea.Msg {
		err := os.Remove(name)
		if err != nil && !os.IsNotExist(err) {
			return dbActionMsg{err: err}
		}
		// time.Sleep(2 * time.Second) // Simulate some work
		return dbActionMsg{err: nil}
	}
}

func viewDatabase(name string) tea.Cmd {
	return func() tea.Msg {
		var tableChoice string

		form := huh.NewForm(
			huh.NewGroup(
				huh.NewSelect[string]().
					Title("Select a table to view:").
					Options(
						huh.NewOption("users", "users"),
						huh.NewOption("passwords", "passwords"),
						huh.NewOption("sessions", "sessions"),
					).
					Value(&tableChoice),
			),
		)

		err := form.Run()
		if err != nil {
			return dbActionMsg{err: err}
		}

		db, err := sql.Open("sqlite3", name)
		if err != nil {
			return dbActionMsg{err: err}
		}
		defer db.Close()

		rows, err := db.Query(fmt.Sprintf("SELECT * FROM %s", tableChoice))
		if err != nil {
			return dbActionMsg{err: err}
		}
		defer rows.Close()

		columns, err := rows.Columns()
		if err != nil {
			return dbActionMsg{err: err}
		}

		// Prepare table columns
		tableColumns := make([]table.Column, len(columns))
		for i, col := range columns {
			tableColumns[i] = table.Column{Title: col, Width: 15}
		}

		// Prepare table rows
		var tableRows []table.Row
		for rows.Next() {
			columnsData := make([]interface{}, len(columns))
			columnsPointers := make([]interface{}, len(columns))
			for i := range columnsData {
				columnsPointers[i] = &columnsData[i]
			}

			err = rows.Scan(columnsPointers...)
			if err != nil {
				return dbActionMsg{err: err}
			}
			row := make(table.Row, len(columns))
			for i, col := range columnsData {
				row[i] = fmt.Sprintf("%v", col)
			}
			tableRows = append(tableRows, row)
		}

		if err = rows.Err(); err != nil {
			return dbActionMsg{err: err}
		}

		// Create and run the table program
		t := table.New(
			table.WithColumns(tableColumns),
			table.WithRows(tableRows),
			table.WithFocused(true),
			table.WithHeight(10),
		)

		s := table.DefaultStyles()
		s.Header = s.Header.
			BorderStyle(lipgloss.NormalBorder()).
			BorderForeground(lipgloss.Color("240")).
			BorderBottom(true).
			Bold(false)
		s.Selected = s.Selected.
			Foreground(lipgloss.Color("229")).
			Background(lipgloss.Color("57")).
			Bold(false)
		t.SetStyles(s)

		m := tableModel{t}
		if _, err := tea.NewProgram(m).Run(); err != nil {
			return dbActionMsg{err: fmt.Errorf("error running table program: %w", err)}
		}

		return dbActionMsg{err: nil}
	}
}

type tableModel struct {
	table table.Model
}

func (m tableModel) Init() tea.Cmd { return nil }

func (m tableModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "esc", "ctrl+c":
			return m, tea.Quit
		}
	}
	m.table, cmd = m.table.Update(msg)
	return m, cmd
}

func (m tableModel) View() string {
	return baseStyle.Render(m.table.View()) + "\n"
}

var baseStyle = lipgloss.NewStyle().
	BorderStyle(lipgloss.NormalBorder()).
	BorderForeground(lipgloss.Color("240"))

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
					huh.NewOption("View development database", "view_dev"),
					huh.NewOption("View production database", "view_prod"),
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
	case "drop_prod":
		fmt.Println("Dropping prod database...")
		cmd = dropDatabase("prod.db")
	case "view_dev":
		fmt.Println("Viewing dev database...")
		cmd = viewDatabase("dev.db")
	case "view_prod":
		fmt.Println("Viewing prod database...")
		cmd = viewDatabase("prod.db")
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
