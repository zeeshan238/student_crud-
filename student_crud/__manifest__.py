{
    'name': 'Student CRUD',
    'version': '1.0',
    'summary': 'Basic Student CRUD operations',
    'description': 'A simple module for Odoo 17 to manage students.',
    'category': 'Education',
    'author': 'Antigravity',
    'depends': ['base', 'web', 'website'],
    'data': [
        'security/ir.model.access.csv',
        'views/student_views.xml',
        'views/website_templates.xml',
    ],

    'assets': {
        'web.assets_backend': [
            'student_crud/static/src/js/student_form.js',
            'student_crud/static/src/js/student_dashboard.js',
            'student_crud/static/src/scss/student_dashboard.scss',
            'student_crud/static/src/xml/student_dashboard.xml',
        ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
