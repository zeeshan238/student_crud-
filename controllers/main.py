# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request

print("--- Loading Student CRUD Controllers ---")

class StudentController(http.Controller):


    @http.route('/student_test', type='http', auth='public')
    def test_route(self, **kwargs):
        return "Controller is successfully loaded!"

    @http.route(['/students', '/students/<int:student_id>'], type='http', auth="public", website=True, sitemap=True)

    def list_students(self, student_id=None, **kwargs):
        if student_id:
            # Show individual student details
            student = request.env['student.student'].sudo().browse(student_id)
            if not student.exists():
                return request.render('website.404')
            return request.render('student_crud.student_detail_template', {
                'student': student,
            })
        
        # List all students
        students = request.env['student.student'].sudo().search([])
        return request.render('student_crud.student_list_template', {
            'students': students,
        })
