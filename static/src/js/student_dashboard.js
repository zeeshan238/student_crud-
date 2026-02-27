/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, useRef, onMounted, useState, onWillUnmount } from "@odoo/owl";
import { loadJS } from "@web/core/assets";
import { standardActionServiceProps } from "@web/webclient/actions/action_service";

console.log("StudentDashboard: JS File Loading...");

export class StudentDashboard extends Component {
    setup() {
        console.log("StudentDashboard: Setup starting...");
        this.orm = useService("orm");
        this.action = useService("action");
        this.state = useState({
            totalStudents: 0,
            newAdmissionsToday: 0,
            genderData: [],
            ageData: [],
            recentAdmissions: [],
            loading: true,
        });
        this.chartRef = useRef("chartRef");
        this.genderChartRef = useRef("genderChartRef");
        this.charts = {};

        onWillStart(async () => {
            try {
                // Ensure Chart.js is loaded
                if (!window.Chart) {
                    await loadJS("/web/static/lib/Chart/Chart.js");
                }
                await this.loadData();
            } catch (error) {
                console.error("StudentDashboard: onWillStart failed", error);
                this.state.loading = false;
            }
        });

        onMounted(() => {
            if (!this.state.loading) {
                this.renderCharts();
            }
        });

        onWillUnmount(() => {
            if (this.charts) {
                Object.values(this.charts).forEach(chart => {
                    if (chart && typeof chart.destroy === 'function') {
                        chart.destroy();
                    }
                });
            }
        });
    }

    async loadData() {
        try {
            console.log("StudentDashboard: Loading data...");

            // 1. Fetch total students
            try {
                const totalCount = await this.orm.searchCount("student.student", []);
                this.state.totalStudents = totalCount || 0;
            } catch (e) {
                console.warn("Model student.student not found or inaccessible", e);
                this.state.totalStudents = 0;
            }

            // 2. Fetch admissions today
            const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
            try {
                const todayCount = await this.orm.searchCount("student.student", [["admission_date", "=", today]]);
                this.state.newAdmissionsToday = todayCount || 0;
            } catch (e) {
                console.warn("Failed to load today's admissions, likely model or field missing", e);
            }

            // 3. Fetch gender distribution
            try {
                const genderGroups = await this.orm.readGroup("student.student", [], ["gender"], ["gender"]);
                this.state.genderData = genderGroups.map(g => ({
                    label: this.formatLabel(g.gender),
                    count: g.gender_count || g.__count || 0
                }));
            } catch (e) {
                console.warn("Failed to load gender data", e);
            }

            // 4. Fetch age distribution
            try {
                const ageGroups = await this.orm.readGroup("student.student", [], ["age"], ["age"]);
                this.state.ageData = ageGroups.map(g => ({
                    age: g.age !== undefined ? g.age : "N/A",
                    count: g.age_count || g.__count || 0
                }));
            } catch (e) {
                console.warn("Failed to load age data", e);
            }

            // 5. Fetch recent admissions
            try {
                const recent = await this.orm.searchRead("student.student", [], ["name", "admission_date", "gender"], {
                    limit: 5,
                    order: "id desc"
                });
                this.state.recentAdmissions = recent || [];
            } catch (e) {
                console.warn("Failed to load recent admissions", e);
            }

            console.log("StudentDashboard: Data loaded successfully", this.state);
        } catch (error) {
            console.error("StudentDashboard: Global error in loadData", error);
        } finally {
            this.state.loading = false;
            // If component is already mounted, trigger chart rendering
            if (this.genderChartRef.el) {
                this.renderCharts();
            }
        }
    }


    formatLabel(val) {
        if (val === false || val === null || val === undefined) return "Unknown";
        if (typeof val === 'string') {
            return val.charAt(0).toUpperCase() + val.slice(1);
        }
        return String(val);
    }

    renderCharts() {
        if (!this.genderChartRef.el || !this.chartRef.el || !window.Chart) {
            console.warn("StudentDashboard: Canvas or Chart.js not ready");
            return;
        }

        try {
            // Destroy existing charts
            if (this.charts.gender) this.charts.gender.destroy();
            if (this.charts.age) this.charts.age.destroy();

            // Gender Chart
            if (this.state.genderData.length > 0) {
                this.charts.gender = new Chart(this.genderChartRef.el, {
                    type: 'doughnut',
                    data: {
                        labels: this.state.genderData.map(d => d.label),
                        datasets: [{
                            data: this.state.genderData.map(d => d.count),
                            backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
                        }],
                    },
                    options: {
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    },
                });
            }

            // Age Chart
            if (this.state.ageData.length > 0) {
                this.charts.age = new Chart(this.chartRef.el, {
                    type: 'bar',
                    data: {
                        labels: this.state.ageData.map(d => `Age ${d.age}`),
                        datasets: [{
                            label: "Students",
                            backgroundColor: "#4e73df",
                            data: this.state.ageData.map(d => d.count),
                        }],
                    },
                    options: {
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, ticks: { precision: 0 } }
                        }
                    }
                });
            }
        } catch (error) {
            console.error("StudentDashboard: Error during chart rendering", error);
        }
    }

    onStudentClick(studentId) {
        this.action.doAction({
            type: 'ir.actions.act_window',
            res_model: 'student.student',
            res_id: studentId,
            views: [[false, 'form']],
            target: 'current',
        });
    }
}

StudentDashboard.template = "student_crud.StudentDashboard";
StudentDashboard.props = { ...standardActionServiceProps };

console.log("StudentDashboard: Registering action...");
registry.category("actions").add("student_dashboard_action", StudentDashboard);
console.log("StudentDashboard: Action registered successfully!");
